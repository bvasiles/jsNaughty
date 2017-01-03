'''
Created on Dec 22, 2016

@author: bogdanv
'''

# from pygments.token import Token, is_token_subtype
# import hashlib
from copy import deepcopy


def isHash(name):
    # _45e4313f
    return len(name) == 9 and name[0] == '_' and name[1:].isalnum()
 

class Renamer:
    
    def __init__(self, iBuilder):
        self.draft_translation = deepcopy(iBuilder.tokens)
        
    def apply_renaming(self,
                       name_positions, 
                       renaming_map, 
                       fallback_renaming_map={}):
    
        for ((name, def_scope), _use_scope), renaming in renaming_map.iteritems():
            for (line_num, line_idx) in name_positions[(name, def_scope)]:
                (token_type, token) = self.draft_translation[line_num][line_idx]
                if not isHash(renaming):
                    self.draft_translation[line_num][line_idx] = (token_type, renaming)
                else:
                    self.draft_translation[line_num][line_idx] = (token_type, \
                                 fallback_renaming_map.get((name, def_scope), token))
    
        return self.draft_translation

