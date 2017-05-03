'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
@author: Casey Casalnuovo
'''

from lmQuery import LMQuery
import itertools
import numpy as np
from suggestionMetrics import hasCamelCase

ENTROPY_ERR = -9999999999

class BasicConsistencyResolver:

    def __init__(self, 
                 debug_mode=False):

        self.debug_mode = debug_mode
        
        # Return value
        self.renaming_map = {}
        
        # Keeps track of which suggested name translations have already been 
        # used in which scope
        self.seen = {}
        
        self.sorting_key = lambda e: e
        
        self.newid = itertools.count().next


    def _isHash(self, 
                 name):
        # _45e4313f
        return len(name) == 9 and name[0] == '_' and name[1:].isalnum()
    
    
    def _markSeen(self,
                   candidate_name,
                   use_scopes):
        """
        Helper: Mark candidate_name as seen in every scope in use_scopes
            so as not to assign it to another identifier in the same scope.
        
        Parameters
        ----------
        candidate_name: suggested name translation
        use_scopes: set of scope ids
        """
        for use_scope in use_scopes:
            self.seen[(candidate_name, use_scope)] = True
        
#             if self.debug_mode:
#                 print '   ^ seen:', use_scope[-50:], candidate_name 


    def _extractTempLines(self,
                           name_positions_key,
                           iBuilder):
        """
        Helper: Returns input lines where a certain name appears 
        
        Parameters
        ----------
        name_positions_key: name_positions[key]
            = list of (line_num, line_idx) tuples where the identifier
                 appears in the input; line_idx is a within-line token index,
                 e.g., "i" in "for(int i = 0;" would have index 3 (4th token).
        iBuilder: indexBuilder object that contains the indexed input text
        
        Returns
        -------
        (lines, pairs): a line is a list of tokens; lines is a list of line 
            lists; pairs is a list of (subset_idx, input_idx) tuples to map
            line indices in the input to line indices in the subset.
        """
        
        # Line numbers of lines where (name, def_scope) appears
        line_nums = set([l_num for (l_num, l_idx) in name_positions_key])

        # Subset of input lines containing the identifier 
        lines = []
        
        # Correspondence between index in the above list and 
        # line number in original input. For example, if identifier
        # x appeared on lines 3, 5, 8 in the original input, the 
        # correspondence is (0, 3), (1, 5), (3, 8)
        pairs = []
        
        # Within-line indices where (name, def_scope) appears
        for draft_line_num, line_num in enumerate(sorted(line_nums)):
            pairs.extend([(draft_line_num, l_idx) 
                          for (l_num, l_idx) in name_positions_key 
                          if l_num == line_num])
            
            lines.append([token for (_token_type, token) 
                              in iBuilder.tokens[line_num]])
        
        return (lines, pairs)
    

    def _rankUnseenCandidates(self,
                               key,
                               unseen_candidates,
                               name_candidates,
                               name_positions,
                               iBuilder):
        """
        Default: Sorts candidates by frequency

        Parameters
        ----------
        key: (name, def_scope) identifier to be renamed
        
        unseen_candidates: set of candidate name translations to consider
        
        name_candidates: dict
            name_candidates[(name, def_scope)][name_translation] 
                = set of line numbers in the translation
                An identifier (name, def_scope) may appear on many lines in 
                the input. Each line is translated independently by Moses.
                We will need to choose one of potentially multiple suggested
                translations for a name. We may decide to give more weight to 
                translations suggested consistently for different lines in 
                the input. 
                
        name_positions: dict
             name_positions[(token, def_scope)]
                 = list of (line_num, line_idx) tuples where the identifier
                 appears in the input; line_idx is a within-line token index,
                 e.g., "i" in "for(int i = 0;" would have index 3 (4th token).
        
        iBuilder: indexBuilder object that contains the indexed input text
        
        sorting_key: lambda sorting key
        
        Returns
        -------
        sorted list of (candidate_name, num_lines) tuples, with
            the first element being the most desirable.
        """
        candidate_translations = []
        
        for unseen_candidate in unseen_candidates:
            candidate_translations.append([unseen_candidate, 
                                           len(name_candidates[key][unseen_candidate])])
     
        if self.debug_mode:
            (name, def_scope) = key
            (lines, pairs) = self._extractTempLines(name_positions[key], 
                                                    iBuilder)
            draft_lines_str = self._insertNameInTempLines(name, 
                                                           lines, 
                                                           pairs)
         
            print '\n   ^ draft lines -----'
            for line in draft_lines_str:
                print '    ', line
            print
     
        return sorted(candidate_translations, key=self.sorting_key)
    
    
    
    def _insertNameInTempLines(self,
                                candidate_name,
                                lines,
                                pairs):
        """
        Helper: Returns input lines where a certain name appears 
        
        Parameters
        ----------
        candidate_name: suggested name translation
        lines: a line is a list of tokens; lines is a list of line lists
        pairs: list of (subset_idx, input_idx) tuples to map line indices 
            in the input to line indices in the subset.
        
        Returns
        -------
        draft_lines_str: list of line strings after substituting the candidate
            translation in each lines.
        """
        
        draft_lines = lines
        for (draft_line_num, idx) in pairs:
            draft_lines[draft_line_num][idx] = candidate_name
            
        draft_lines_str = [' '.join(draft_line) 
                           for draft_line in draft_lines]
        
        return draft_lines_str

    
    def computeRenaming(self, 
                        name_candidates, 
                        name_positions, 
                        all_use_scopes, 
                        iBuilder=None):
        
        done = {}
        
        # Sort names by how many lines they appear 
        # on in the input, descending
        for (key, (num_lines, suggestions)) in \
                self._sortedCandidateTranslations(name_candidates, 
                                                   name_positions):
            
            use_scopes = all_use_scopes[key]
            (name, def_scope) = key
            
            if self.debug_mode:
                print '\nLM-ing', name, '...', num_lines
                print 'candidates:', suggestions
#                 print 'def_scope: ...', def_scope[-50:]
#                 for use_scope in use_scopes:
#                     print 'use_scope: ...', use_scope[-50:]
#                 print '\nseen:'
#                 for (c,u),f in self.seen.iteritems():
#                     print (c,u[-50:]), f
                
            # The candidate pool could have shrunk if I've used this
            # translation elsewhere in the same scope
            unseen_candidates = self._updateCandidates(suggestions, 
                                                        use_scopes)
            
            if self.debug_mode:
                print 'unseen candidates:', unseen_candidates
            
            # There is no uncertainty about the translation for
            # variables that have a single candidate translation
            if len(unseen_candidates) == 1:
                
                candidate_name = unseen_candidates.pop()
                
                self.renaming_map[key] = candidate_name
                self._markSeen(candidate_name, use_scopes)
                
                done[key] = True
                
                if self.debug_mode:
                    print '\n  single candidate:', candidate_name
        
        
        # Sort names by how many lines they appear 
        # on in the input, descending
        for (key, (num_lines, suggestions)) in \
                self._sortedCandidateTranslations(name_candidates, 
                                                   name_positions):
            if done.get(key, False):
                continue
            
            use_scopes = all_use_scopes[key]
            (name, def_scope) = key
            #if(True):
            if self.debug_mode:
                print '\nLM-ing', name, '...', num_lines
                print 'candidates:', suggestions
#                 print 'def_scope: ...', def_scope[-50:]
#                 for use_scope in use_scopes:
#                     print 'use_scope: ...', use_scope[-50:]
#                 print '\nseen:'
#                 for (c,u),f in self.seen.iteritems():
#                     print (c,u[-50:]), f
                
            # The candidate pool could have shrunk if I've used this
            # translation elsewhere in the same scope
            unseen_candidates = self._updateCandidates(suggestions, 
                                                        use_scopes)
            
            if self.debug_mode:
                print 'unseen candidates:', unseen_candidates
            
            # There is no uncertainty about the translation for
            # variables that have a single candidate translation
            if len(unseen_candidates) == 1:
                
                candidate_name = unseen_candidates.pop()
                
                self.renaming_map[key] = candidate_name
                self._markSeen(candidate_name, use_scopes)
                
                if self.debug_mode:
                    print '\n  single candidate:', candidate_name
                    
            elif len(unseen_candidates) > 1:
                
                candidate_names = self._rankUnseenCandidates(key,
                                                              unseen_candidates,
                                                              name_candidates,
                                                              name_positions,
                                                              iBuilder)

                candidate_name = candidate_names[0][0]
                    
                if self.debug_mode:
                    print '\n   ^ log probs -------'                        
                    for idx, (c, lm_log_prob) in enumerate(candidate_names):
                        if idx == 0:
                            print '    ', (c, lm_log_prob), ' --- this should be selected'
                        else:
                            print '    ', (c, lm_log_prob)
                    print
                    print '   ^ selected:', candidate_name
                
                self.renaming_map[key] = candidate_name
                self._markSeen(candidate_name, use_scopes)

            else:
                candidate_name = name
                
                if not self._isHash(candidate_name):
                    while not self._isScopeValid(candidate_name, use_scopes):
                        candidate_name = '%s%d' % (candidate_name, self.newid())
                
                self.renaming_map[key] = candidate_name
                self._markSeen(candidate_name, use_scopes)

        return (self.renaming_map, self.seen)
    
    
    
    def _sortedCandidateTranslations(self,
                                      name_candidates,
                                      name_positions):
        """
        Sort names by how many lines they appear on in the input, descending.
        Return sorted names with all their translation suggestions.
        
        Parameters
        ----------
        name_candidates: dict
            name_candidates[(name, def_scope)][name_translation] 
                = set of line numbers in the translation
                An identifier (name, def_scope) may appear on many lines in 
                the input. Each line is translated independently by Moses.
                We will need to choose one of potentially multiple suggested
                translations for a name. We may decide to give more weight to 
                translations suggested consistently for different lines in 
                the input. 
        name_positions: dict
             name_positions[(token, def_scope)]
                 = list of (line_num, line_idx) tuples where the identifier
                 appears in the input; line_idx is a within-line token index,
                 e.g., "i" in "for(int i = 0;" would have index 3 (4th token).
            
        Returns
        -------
        list of ((token, def_scope), (num_lines, list_of_suggestions)) tuples.
        """
        candidate_translations = {}
     
        for key, val in name_candidates.iteritems():

            num_lines = len(set([line_num for (line_num, _line_idx) 
                                 in name_positions[key]]))
            
            candidate_translations[key] = (num_lines, val.keys())
                
        return sorted(candidate_translations.items(), \
                      key = lambda (key, (num_lines, s)): -num_lines)
    
    
    def _isInvalid(self,
                   candidate_name):
        return False
    
    
    def _isScopeValid(self,
                        candidate_name,
                        use_scopes):
        
        valid = True
        for use_scope in use_scopes:
            if self.seen.get((candidate_name, use_scope), False) \
                    or self._isInvalid(candidate_name):
                valid = False
        return valid
    
        
    def _updateCandidates(self, 
                           suggestions,
                           use_scopes):
        
        """
        Helper: Update pool of suggested name translations to exclude hashes 
        and names used elsewhere in the same scope.
        
        Parameters
        ----------
        suggestions: list of suggested (by Moses) translations for a name.
        use_scopes: set of all scope ids where current name appears.
        
        Returns
        -------
        unseen_candidates: set of valid suggested name translations.
        """
        unseen_candidates = set([])
        for candidate_name in suggestions:
            if self.debug_mode:
                print("Checking validity! " + candidate_name)
            if self._isScopeValid(candidate_name, use_scopes):
                unseen_candidates.add(candidate_name)
        
        return unseen_candidates




class ConsistencyResolver(BasicConsistencyResolver):
     
    def _isInvalid(self,
                   candidate_name):
        return self._isHash(candidate_name)
        
    

class LMConsistencyResolver(ConsistencyResolver):
    
    def __init__(self, 
                 debug_mode,
                 lm_path):
        ConsistencyResolver.__init__(self, debug_mode=debug_mode)
        
        self.lm_cache = {}
        self.lm_query = LMQuery(lm_path=lm_path)
        
        
    def _lmQueryLines(self,
                       draft_lines_str):
        """
        Helper: Pass a list of line strings through language model, return
            log probabilities for each line.
        
        Parameters
        ----------
        draft_lines_str: list of line strings after substituting the candidate
            translation in each lines.
        
        Returns
        -------
        line_log_probs: dict; each key is a line index; values are log 
            probabilities for those lines
        """
        
        line_log_probs = {}
        for idx, line in enumerate(draft_lines_str):
             
            (lm_ok, lm_log_prob, _lm_err) = \
                self.lm_cache.setdefault(line, self.lm_query.queryServer(line)) #faster
                #self.lm_cache.setdefault(line, self.lm_query.run(line)) #slow
                
             
            if not lm_ok:
                lm_log_prob = ENTROPY_ERR
             
            line_log_probs[idx] = lm_log_prob
         
        return line_log_probs
                


class LMAvgConsistencyResolver(LMConsistencyResolver):
    
    def _rankUnseenCandidates(self,
                               key,
                               unseen_candidates,
                               name_candidates,
                               name_positions,
                               iBuilder):
        """
        Ranks candidate name translations by average LM log probability
        over all input lines where name appears. First element fits LM best. 
        
        Parameters
        ----------
        key: (name, def_scope) identifier to be renamed
        
        unseen_candidates: set of candidate name translations to consider
        
        name_candidates: dict
            name_candidates[(name, def_scope)][name_translation] 
                = set of line numbers in the translation
                An identifier (name, def_scope) may appear on many lines in 
                the input. Each line is translated independently by Moses.
                We will need to choose one of potentially multiple suggested
                translations for a name. We may decide to give more weight to 
                translations suggested consistently for different lines in 
                the input. 
                
        name_positions: dict
             name_positions[(token, def_scope)]
                 = list of (line_num, line_idx) tuples where the identifier
                 appears in the input; line_idx is a within-line token index,
                 e.g., "i" in "for(int i = 0;" would have index 3 (4th token).
        
        iBuilder: indexBuilder object that contains the indexed input text
        
        Returns
        -------
        log_probs: sorted list of (candidate_name, lm_log_prob) tuples, with
            the first element being the most desirable. 
        """
    
        # Lines where (name, def_scope) appears
        (lines, pairs) = self._extractTempLines(name_positions[key], 
                                                 iBuilder)
        
        log_probs = []
                 
        if self.debug_mode:
            (name, _def_scope) = key
            draft_lines_str = self._insertNameInTempLines(name, 
                                                           lines, 
                                                           pairs)
            
            print '\n   ^ draft lines -----'
            for line in draft_lines_str:
                print '    ', line
            print
            
        for candidate_name in unseen_candidates:
             
            draft_lines_str = self._insertNameInTempLines(candidate_name, 
                                                           lines, 
                                                           pairs)
            
            if self.debug_mode:
                print '\n  candidate:', candidate_name
                 
            translated_log_probs = self._lmQueryLines(draft_lines_str)
            
            if self.debug_mode:
                for idx, lm_log_prob in translated_log_probs.iteritems():
                    print '\t\t prob[%d] =' % idx, lm_log_prob
            
            lm_log_prob = float(sum(translated_log_probs.values())/len(translated_log_probs.keys()))
        
            log_probs.append((candidate_name, lm_log_prob))
                 
        return sorted(log_probs, key=lambda e:-e[1])
    


class LMDropConsistencyResolver(LMConsistencyResolver):
    
    def __init__(self, 
             debug_mode,
             lm_path):
    
        LMConsistencyResolver.__init__(self, debug_mode, lm_path)
    
        #A series of caches for building a model comparing the entropy changes for various suggestions to a variable. 
        #All of these are keyed by (name, def_scope, suggested_translation)
        
        #Caches for sorting all the entropies prior to computation.  The values are a list of entropies or entropy drops
        self.log_probs = {}
        self.log_drops = {}
        
    def getEntropyStats(self, variable, suggestion):
        """
        Returns a set of entropy stats about a variable and suggestion combination.
        
        Parameters
        ----------
        variable: (name, def_scope) identifier to be renamed
        suggestion: string for the replacement name
        
        unseen_candidates: set of candidate name translations to consider
        
        Returns
        -------
        (average log prob, average drop, min gain in log prob, max gain in log prob)
        if nothing is listed for the probabilites, return 4 copies of ENTROPY_ERR
        """
        cacheKey = (variable[0], variable[1], suggestion)
        if self.debug_mode:
            print(cacheKey)
            #print(self.log_probs[cacheKey])
        if(cacheKey in self.log_probs and len(self.log_probs[cacheKey]) != 0):
            aveLogProb = sum(self.log_probs[cacheKey])/(float)(len(self.log_probs[cacheKey]))
            
            aveLogDrop = sum(self.log_drops[cacheKey])/(float)(len(self.log_drops[cacheKey]))
            #Are these negative?
            minGain = max(self.log_drops[cacheKey])
            maxGain = min(self.log_drops[cacheKey])
            return (aveLogProb, aveLogDrop, minGain, maxGain)
        else:#This key has been dropped in the consistency checks.
            return (ENTROPY_ERR, ENTROPY_ERR, ENTROPY_ERR, ENTROPY_ERR)
        
    
    def _rankUnseenCandidates(self,
                               key,
                               unseen_candidates,
                               name_candidates,
                               name_positions,
                               iBuilder):
        """
        Ranks candidate name translations by max LM log probability drop
        over all input lines where name appears. First element fits LM best. 
        
        Parameters
        ----------
        key: (name, def_scope) identifier to be renamed
        
        unseen_candidates: set of candidate name translations to consider
        
        name_candidates: dict
            name_candidates[(name, def_scope)][name_translation] 
                = set of line numbers in the translation
                An identifier (name, def_scope) may appear on many lines in 
                the input. Each line is translated independently by Moses.
                We will need to choose one of potentially multiple suggested
                translations for a name. We may decide to give more weight to 
                translations suggested consistently for different lines in 
                the input. 
                
        name_positions: dict
             name_positions[(token, def_scope)]
                 = list of (line_num, line_idx) tuples where the identifier
                 appears in the input; line_idx is a within-line token index,
                 e.g., "i" in "for(int i = 0;" would have index 3 (4th token).
        
        iBuilder: indexBuilder object that contains the indexed input text
        
        Returns
        -------
        log_probs: sorted list of (candidate_name, lm_log_prob) tuples, with
            the first element being the most desirable. 
        """
        
        
        (name, _def_scope) = key
        
        # Lines where (name, def_scope) appears
        (lines, pairs) = self._extractTempLines(name_positions[key], 
                                                 iBuilder)
        
        draft_lines_str = self._insertNameInTempLines(name, lines, pairs)
        untranslated_log_probs = self._lmQueryLines(draft_lines_str)
         
        if self.debug_mode:
            print '\n  minified:', name
            print '\n   ^ draft lines -----'
            for idx, line in enumerate(draft_lines_str):
                print '    ', line, untranslated_log_probs[idx]
            print
    
        log_probs = []
                 
        for candidate_name in unseen_candidates:
             
            cacheKey = (name, _def_scope, candidate_name)
            if(cacheKey not in self.log_probs):
                self.log_probs[cacheKey] = []
            
            if(cacheKey not in self.log_drops):
                self.log_drops[cacheKey] = []
             
            draft_lines_str = self._insertNameInTempLines(candidate_name, 
                                                           lines, 
                                                           pairs)
             
            if self.debug_mode:
                print '\n  candidate:', candidate_name
        
#                 print '\n   ^ draft lines -----'
#                 for line in draft_lines_str:
#                     print '    ', line
#                 print
                
            translated_log_probs = self._lmQueryLines(draft_lines_str)
                         
            line_log_probs = []
            for idx, lm_log_prob in translated_log_probs.iteritems():
                drop = untranslated_log_probs[idx] - lm_log_prob
                
                line_log_probs.append(drop)
                self.log_drops[cacheKey].append(drop)
                self.log_probs[cacheKey].append(lm_log_prob)
                
                if self.debug_mode:
                    print '\t\t prob[%d] =' % idx, lm_log_prob, '\tdrop[%d] =' % idx, untranslated_log_probs[idx] - lm_log_prob
            
            if not len(line_log_probs):
                lm_log_prob = ENTROPY_ERR
            else:
                lm_log_prob = min(line_log_probs)
            
            log_probs.append((candidate_name, lm_log_prob))
            
        return sorted(log_probs, key=lambda e:e[1])
                          

                                 
class FreqLenConsistencyResolver(ConsistencyResolver):
    
    def __init__(self, 
                 debug_mode):
        ConsistencyResolver.__init__(self, debug_mode)
        
        # Sorts candidates by how many times (lines) they were suggested 
        # as translations. Break ties by length
        self.sorting_key = lambda e:(-e[1],-len(e[0]))
    
    
    

class LenConsistencyResolver(ConsistencyResolver):
    
    def __init__(self, 
                 debug_mode):
        ConsistencyResolver.__init__(self, debug_mode)
        
        # Sorts candidates by length
        self.sorting_key = lambda e:-len(e[0])
    
    
    
class LogModelConsistencyResolver(LMDropConsistencyResolver):
    
    def __init__(self, 
             hash_to_min,
             debug_mode,
             lm_path):
    
        LMDropConsistencyResolver.__init__(self, debug_mode, lm_path)
        
        #Pass in the name features so we can track
        #We need to remember what the original minified names are so we can look them up in vm.
        self.hash_name_map = hash_to_min
        #Initialize the model constraints
        #Based on the log odds from the model on exact match (These will change as models change...)
        self.weights = {}
        self.weights["name_length"] = 1.689885 #Length > 1
        self.weights["ent_drop"] = -0.394647
        self.weights["ave_ent"] = -0.010443
        self.weights["lines_suggested"] = 2.107397 #log
    
    def calculateWeight(self, suggestion, entropy_drop, ave_entropy, lines_suggested):
        """
        Produce a weight for a suggestion determined by the
        logistic model.
        
        Parameters
        ----------
        suggestion: The suggested name
        
        entropy_drop: The average drop in entropy it causes
        
        ave_entropy: The average entropy across the instances
        
        external_def: Is the name defined on a line where there is an unminified name (0 no, 1 yes)
       
        lines_suggested: The count of lines this particular suggestion was made for. 
        Returns
        -------
        weight: a float giving this items weight for ranking
        """
        name_length = len(suggestion) > 1
        #Default to just the name length and external_def if there are entropy issues.
        if(ave_entropy == ENTROPY_ERR or entropy_drop == ENTROPY_ERR):
            ave_entropy = 0.0
            entropy_drop = 0.0

        #Thresholding ... (using model cutoffs)
        if(ave_entropy < -70.0):
            ave_entropy = -70.0
 
        if(lines_suggested > 10):
            lines_suggested = 10

        lines_suggested = np.log(lines_suggested + .01)

        #camel_case = hasCamelCase(suggestion)
            
        return self.weights["name_length"] * name_length + \
               self.weights["ent_drop"] * entropy_drop + \
               self.weights["ave_ent"]* ave_entropy + \
               self.weights["lines_suggested"] * lines_suggested

       
    def _rankUnseenCandidates(self,
                               key,
                               unseen_candidates,
                               name_candidates,
                               name_positions,
                               iBuilder):
        """
        Ranks candidate name translations by weights determined by the
        logistic model.
        Items that are taken into account:
        length of suggested name.
        lm-drop
        average-lm
        camel case
        # lines suggested for
        
        
        Parameters
        ----------
        key: (name, def_scope) identifier to be renamed
        
        unseen_candidates: set of candidate name translations to consider
        
        name_candidates: dict
            name_candidates[(name, def_scope)][name_translation] 
                = set of line numbers in the translation
                An identifier (name, def_scope) may appear on many lines in 
                the input. Each line is translated independently by Moses.
                We will need to choose one of potentially multiple suggested
                translations for a name. We may decide to give more weight to 
                translations suggested consistently for different lines in 
                the input. 
                
        name_positions: dict
             name_positions[(token, def_scope)]
                 = list of (line_num, line_idx) tuples where the identifier
                 appears in the input; line_idx is a within-line token index,
                 e.g., "i" in "for(int i = 0;" would have index 3 (4th token).
        
        iBuilder: indexBuilder object that contains the indexed input text
        
        Returns
        -------
        log_probs: sorted list of (candidate_name, weight) tuples, with
            the first element being the most desirable. 
        """
        
        
        (name, _def_scope) = key
        
        # Lines where (name, def_scope) appears
        (lines, pairs) = self._extractTempLines(name_positions[key], 
                                                 iBuilder)
        
        draft_lines_str = self._insertNameInTempLines(name, lines, pairs)
        untranslated_log_probs = self._lmQueryLines(draft_lines_str)
         
        if self.debug_mode:
            print '\n  minified:', name
            print '\n   ^ draft lines -----'
            for idx, line in enumerate(draft_lines_str):
                print '    ', line, untranslated_log_probs[idx]
            print
    
        log_probs = []
                 
        for candidate_name in unseen_candidates:
             
            cacheKey = (name, _def_scope, candidate_name)
            if(cacheKey not in self.log_probs):
                self.log_probs[cacheKey] = []
            
            if(cacheKey not in self.log_drops):
                self.log_drops[cacheKey] = []
             
            draft_lines_str = self._insertNameInTempLines(candidate_name, 
                                                           lines, 
                                                           pairs)
            
            translated_log_probs = self._lmQueryLines(draft_lines_str)
                         
            line_log_probs = []
            for idx, lm_log_prob in translated_log_probs.iteritems():
                drop = untranslated_log_probs[idx] - lm_log_prob
                
                #line_log_probs.append(drop)
                self.log_drops[cacheKey].append(drop)
                self.log_probs[cacheKey].append(lm_log_prob)
                
            #(average log prob, average drop, min gain in log prob, max gain in log prob) 
            s_feat = self.getEntropyStats((name, _def_scope), candidate_name)
            lines_suggested = len(name_candidates[key][candidate_name])
            weight = self.calculateWeight(candidate_name, s_feat[1], 
                                          s_feat[0], lines_suggested)
            if self.debug_mode:
                print('\n candidate:' + candidate_name)
                print('average drop:' + str(s_feat[0]))
                print('average log prob:' + str(s_feat[1]))
                print('lines suggested:' +  str(lines_suggested))
                print('weight:' + str(weight) + '\n')

            log_probs.append((candidate_name, weight))
        #Here bigger weights are better
        return sorted(log_probs, key=lambda e:e[1], reverse=True)

