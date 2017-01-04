'''
Created on Dec 22, 2016

@author: bogdanv
'''

# import os
# import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
#                                              os.path.pardir)))
from lmQuery import LMQuery


class ConsistencyResolver:
    
#     def __init__(self):
#         self.renaming_map = {}
#         self.seen = {}
        
    def computeLMRenaming(self,
                          name_candidates, 
                          name_positions,
                          iBuilder, 
                          lm_path):
        
        renaming_map = {}
        seen = {}
        
        print #len(name_candidates.items())
     
        # There is no uncertainty about the translation for
        # variables that have a single candidate translation
        for (key, val) in [(key, val) 
                     for key, val in name_candidates.items() 
                     if len(val.keys()) == 1]:
                          
            (name, def_scope) = key
            candidate_name = val.keys()[0]
            print (name, def_scope), candidate_name
             
            if not self.seen.has_key((candidate_name, def_scope)):
                renaming_map[key] = candidate_name
                seen[(candidate_name, def_scope)] = True
                 
            else:
                renaming_map[(name, def_scope)] = name
                
        print '\n--', renaming_map
             
        # For the remaining variables, choose the translation that 
        # gives the highest language model log probability
         
        token_lines = []
         
        for key, pos in name_positions.iteritems():
            token_lines.append((key, \
                                len(set([line_num \
                                     for (line_num, _line_idx) in pos]))))
            
        print '\ntoken_lines\n', token_lines
        
        # Sort names by how many lines they appear 
        # on in the input, descending
        token_lines = sorted(token_lines, key=lambda e: -e[1])
    #     print token_lines
         
        for key, _num_lines in token_lines:
            # Sort candidates by how many lines in the translation
            # they appear on, and by name length, both descending
            candidates = sorted([(name_translation, len(line_nums)) \
                                 for (name_translation, line_nums) \
                                 in name_candidates[key].items()], 
                                key=lambda e:(-e[1],-len(e[0])))
             
            if len(candidates) > 1:
     
                log_probs = []
                 
                (name, def_scope) = key
                unseen_candidates = [candidate_name 
                                     for (candidate_name, _occurs) in candidates
                                     if not self.seen.has_key((candidate_name, def_scope))]
                 
                if len(unseen_candidates):
                     
                    for candidate_name in unseen_candidates:
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
                            print (lm_ok, lm_log_prob, _lm_err), line
                             
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
                     
                    renaming_map[key] = candidate_name
                    seen[(candidate_name, def_scope)] = True
                     
                else:
                    renaming_map[key] = name
                    seen[key] = True
                
        return renaming_map
    


    def computeFreqLenRenaming(self,
                               name_candidates, 
                               name_positions,
                               sorting_key):
     
        renaming_map = {}
        seen = {}
     
        # There is no uncertainty about the translation for
        # variables that have a single candidate translation
        for (key, val) in [(key, val) 
                           for key, val in name_candidates.items() 
                           if len(val.keys()) == 1]:
                          
            (name, def_scope) = key
            candidate_name = val.keys()[0]
             
            # Don't use the same translation for different
            # variables within the same scope.
            if not self.seen.has_key((candidate_name, def_scope)):
                renaming_map[key] = candidate_name
                seen[(candidate_name, def_scope)] = True
                 
            else:
                renaming_map[key] = name
             
        # For the remaining variables, choose the translation 
        # that has the longest name
        token_lines = []
        for key, pos in name_positions.iteritems():
            # pos is a list of tuples [(line_num, line_idx)]
            token_lines.append((key, 
                                len(set([line_num 
                                         for (line_num, _line_idx) in pos]))))
             
        # Sort names by how many lines they appear 
        # on in the input, descending
        token_lines = sorted(token_lines, \
                     key=lambda (key, num_lines): -num_lines)
         
        for key, _num_lines in token_lines:
            # Sort candidates by how many lines in the translation
            # they appear on, and by name length, both descending
            candidates = sorted([(name_translation, len(line_nums)) \
                                 for (name_translation, line_nums) \
                                 in name_candidates[key].items()], 
                                key=sorting_key) #lambda e:(-e[1],-len(e[0])))
             
            if len(candidates) > 1:
                (name, def_scope) = key
                unseen_candidates = [candidate_name 
                                     for (candidate_name, _occurs) in candidates
                                     if not self.seen.has_key((candidate_name, def_scope))]
                 
                if len(unseen_candidates):
                    candidate_name = unseen_candidates[0]
                     
                    renaming_map[key] = candidate_name
                    seen[(candidate_name, def_scope)] = True
                else:
                    renaming_map[key] = name
                    seen[(name, def_scope)] = True
                 
        return renaming_map


