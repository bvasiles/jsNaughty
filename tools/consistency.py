'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''

# import os
# import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
#                                              os.path.pardir)))
from lmQuery import LMQuery
from config import ConsistencyStrategies
# from renamer import PostRenamer


def isHash(name):
    # _45e4313f
    return len(name) == 9 and name[0] == '_' and name[1:].isalnum()


class ConsistencyResolver:
    
    def __init__(self):
        self.CS = ConsistencyStrategies()
#         self.renaming_map = {}
#         self.seen = {}
    
    
    def computeRenaming(self,
                        strategy,
                        name_candidates,
                        name_positions,
                        iBuilder=None,
                        lm_path=None):
        
        if strategy == self.CS.LM:
            return self.computeLMRenaming(name_candidates, 
                                          name_positions,
                                          iBuilder, 
                                          lm_path)
        
        elif strategy == self.CS.FREQLEN:
            return self.computeFreqLenRenaming(name_candidates, 
                                               name_positions, 
                                               lambda e:(-e[1],-len(e[0])))
        
        elif strategy == self.CS.LEN:
            return self.computeFreqLenRenaming(name_candidates, 
                                               name_positions, 
                                               lambda e:-len(e[0]))
        else:
            return {}
    
    
    def computeLMRenaming(self,
                          name_candidates, 
                          name_positions,
                          iBuilder, 
                          lm_path):
        
        renaming_map = {}
        seen = {}
        
#         print #len(name_candidates.items())
     
        # There is no uncertainty about the translation for
        # variables that have a single candidate translation
        for key, val in name_candidates.iteritems():
            for use_scope, suggestions in val.iteritems():
                
                if len(suggestions.keys()) == 1:
                    
                    candidate_name = suggestions.keys()[0]
                    
                    (name, _def_scope) = key
                    
                    if not seen.has_key((candidate_name, use_scope)):
    #                     print (key, use_scope), candidate_name
                        renaming_map[(key, use_scope)] = candidate_name
                        seen[(candidate_name, use_scope)] = True
                    else:
    #                     print (key, use_scope), name
    #                     if seen[(name, use_scope)]:
    #                         print (name, use_scope), candidate_name
                        renaming_map[(key, use_scope)] = name
                        seen[(name, use_scope)] = True
                        # You can still get screwed here if name
                        # was the suggestion for something else 
                        # in this scope earlier. Ignoring for now
    
        
        # For the remaining identifiers, choose the translation that 
        # gives the highest language model log probability
        
        token_lines = []
        
        for key, pos in name_positions.iteritems():
            
            token_lines.append((key, \
                            len(set([line_num \
                                 for (line_num, _line_idx) in pos]))))
            
        # Sort names by how many lines they appear 
        # on in the input, descending
        token_lines = sorted(token_lines, key=lambda e: -e[1])
    #     print token_lines
        
        for key, _num_lines in token_lines:
            
            for use_scope, suggestions in name_candidates[key].iteritems():
    #             suggestions[name_translation] = set([line numbers])
            
                # Sort candidates by how many lines in the translation
                # they appear on, and by name length, both descending
                candidates = sorted([(name_translation, len(line_nums)) \
                                     for (name_translation, line_nums) \
                                     in suggestions.items()], 
                                    key=lambda e:(-e[1],-len(e[0])))
            
                if len(candidates) > 1:
        
                    log_probs = []
                    
                    (name, _def_scope) = key
                    unseen_candidates = [candidate_name 
                                         for (candidate_name, _occurs) in candidates
                                         if not seen.has_key((candidate_name, use_scope))]
                    
                    if len(unseen_candidates):
                        
                        for candidate_name in unseen_candidates:
                            
                            # Give no weight to names that remained hashed after translation
                            if isHash(candidate_name):
                                log_probs.append((candidate_name, -9999999999))
                            
                            else:
                                line_nums = set([num \
                                    for (num,idx) in name_positions[key]])
                                
                                draft_lines = []
                                
                                for line_num in line_nums:
                                    draft_line = [token for (_token_type, token) 
                                                  in iBuilder.tokens[line_num]]
                                    for line_idx in [idx 
                                                     for (num, idx) in name_positions[key] 
                                                     if num == line_num]:
                                        draft_line[line_idx] = candidate_name
                                        
                                    draft_lines.append(' '.join(draft_line))
                                    
                                    
                                line_log_probs = []
                                for line in draft_lines:
                                    lmquery = LMQuery(lm_path=lm_path)
                                    (lm_ok, lm_log_prob, _lm_err) = lmquery.run(line)
                                    
                                    if not lm_ok:
                                        lm_log_prob = -9999999999
                                    line_log_probs.append(lm_log_prob)
            
                                if not len(line_log_probs):
                                    lm_log_prob = -9999999999
                                else:
                                    lm_log_prob = float(sum(line_log_probs)/len(line_log_probs))
                
                                log_probs.append((candidate_name, lm_log_prob))
                        
                        candidate_names = sorted(log_probs, key=lambda e:-e[1])
                        candidate_name = candidate_names[0][0]
                        
    #                     print (key, use_scope), candidate_name
                        renaming_map[(key, use_scope)] = candidate_name
                        seen[(candidate_name, use_scope)] = True
                        
                    else:
    #                     if seen[(name, use_scope)]:
    #                         print (name, use_scope), candidate_name
                        
    #                     print (key, use_scope), name
                        renaming_map[(key, use_scope)] = name
                        seen[(name, use_scope)] = True
        
    #     print '\n\n'
        return renaming_map
    


    def computeFreqLenRenaming(self,
                               name_candidates, 
                               name_positions,
                               sorting_key):
     
#         print("name_candidates-------------------------------------")
#         print(name_candidates)
        
#         print("name_positions-------------------------------------")
#         print(name_positions)
     
        renaming_map = {}
        seen = {}
     
        # There is no uncertainty about the translation for
        # variables that have a single candidate translation
        for key, val in name_candidates.iteritems():
            for use_scope, suggestions in val.iteritems():
                
                if len(suggestions.keys()) == 1:
                    
                    candidate_name = suggestions.keys()[0]
                    
                    (name, _def_scope) = key
                    
                    # Don't use the same translation for different
                    # variables within the same scope.
                    if not seen.has_key((candidate_name, use_scope)):
    #                     print (key, use_scope), candidate_name
                        renaming_map[(key, use_scope)] = candidate_name
                        seen[(candidate_name, use_scope)] = True
                    else:
    #                     print (key, use_scope), name
                        renaming_map[(key, use_scope)] = name
                        seen[(name, use_scope)] = True
                        # You can still get screwed here if name
                        # was the suggestion for something else 
                        # in this scope earlier. Ignoring for now
        
        
        # For the remaining variables, choose the translation 
        # that has the longest name
            
        token_lines = []
        
#         print 'first half------------------------------------------'
        
        for key, pos in name_positions.iteritems():
            token_lines.append((key, \
                                len(set([line_num \
                                     for (line_num, _line_idx) in pos]))))
                        
        # Sort names by how many lines they appear 
        # on in the input, descending
        token_lines = sorted(token_lines, key=lambda e: -e[1])
        
#         print 'token_lines------------------------------------------'
#         print token_lines
        
        for key, _num_lines in token_lines:
            
            for use_scope, suggestions in name_candidates[key].iteritems():
    #             suggestions[name_translation] = set([line numbers])
            
                # Sort candidates by how many lines in the translation
                # they appear on, and by name length, both descending
                candidates = sorted([(name_translation, len(line_nums)) \
                                     for (name_translation, line_nums) \
                                     in suggestions.items()], 
                                    key=sorting_key) #lambda e:(-e[1],-len(e[0])))
            
                if len(candidates) > 1:
    
                    (name, _def_scope) = key
                    unseen_candidates = [candidate_name 
                                         for (candidate_name, _occurs) in candidates
                                         if not seen.has_key((candidate_name, use_scope))
                                         and not isHash(candidate_name)]
                    
                    if len(unseen_candidates):
                        candidate_name = unseen_candidates[0]
                        
                        renaming_map[(key, use_scope)] = candidate_name
                        seen[(candidate_name, use_scope)] = True
                        
                    else:
    #                     print (key, use_scope), name
                        renaming_map[(key, use_scope)] = name
                        seen[(name, use_scope)] = True
        
#         print 'renaming_map-----------------------------------'
#         print renaming_map
                
        return renaming_map



