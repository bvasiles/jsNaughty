'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''

from lmQuery import LMQuery


class ConsistencyResolver:
    
    def __init__(self, 
                 debug_mode=False):

        self.debug_mode = debug_mode
        
        # Return value
        self.renaming_map = {}
        
        # Keeps track of which suggested name translations have already been 
        # used in which scope
        self.seen = {}
        
        self.sorting_key = lambda e: e


    def _isHash(self, 
                 name):
        # _45e4313f
        return len(name) == 9 and name[0] == '_' and name[1:].isalnum()

    
    def computeRenaming(self, 
                        name_candidates, 
                        name_positions, 
                        all_use_scopes, 
                        iBuilder=None):
        
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
                self.renaming_map[key] = name
                self._markSeen(name, use_scopes)                    

        return self.renaming_map
    
    
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
            valid = True
            for use_scope in use_scopes:
                if self.seen.get((candidate_name, use_scope), False) \
                        or self._isInvalid(candidate_name):
                    valid = False
            if valid:
                unseen_candidates.add(candidate_name)
        
        return unseen_candidates
    

    
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
        
    

class LMConsistencyResolver(ConsistencyResolver):
    
    def __init__(self, 
                 debug_mode,
                 lm_path):
        ConsistencyResolver.__init__(self, debug_mode=debug_mode)
        
        self.lm_cache = {}
        self.lm_query = LMQuery(lm_path=lm_path)
        
    
    def _isInvalid(self,
                   candidate_name):
        return self._isHash(candidate_name)

        
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
                self.lm_cache.setdefault(line, self.lm_query.run(line))
             
            if not lm_ok:
                lm_log_prob = -9999999999
             
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
             
                 
            translated_log_probs = self._lmQueryLines(draft_lines_str)
                         
            lm_log_prob = float(sum(translated_log_probs.values())/len(translated_log_probs.keys()))
        
            log_probs.append((candidate_name, lm_log_prob))
                 
        return sorted(log_probs, key=lambda e:-e[1])
    


class LMDropConsistencyResolver(LMConsistencyResolver):
    
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
            for line in draft_lines_str:
                print '    ', line
            print
    
        log_probs = []
                 
        for candidate_name in unseen_candidates:
             
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
                line_log_probs.append(untranslated_log_probs[idx] - lm_log_prob)
                
                if self.debug_mode:
                    print '\t\t drop[%d] =' % idx, untranslated_log_probs[idx] - lm_log_prob
            
            if not len(line_log_probs):
                lm_log_prob = -9999999999
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
    
    
    def _isInvalid(self,
                   candidate_name):
        return self._isHash(candidate_name)
    

class LenConsistencyResolver(ConsistencyResolver):
    
    def __init__(self, 
                 debug_mode):
        ConsistencyResolver.__init__(self, debug_mode)
        
        # Sorts candidates by length
        self.sorting_key = lambda e:-len(e[0])
    
    
    def _isInvalid(self,
                   candidate_name):
        return self._isHash(candidate_name)
    
    