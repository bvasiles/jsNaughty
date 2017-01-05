'''
Created on Jan 5, 2017

@author: Bogdan Vasilescu
'''

class RenamingStrategies:
    NONE = 'no_renaming'
    NORMALIZED = 'normalized'
    SCOPE_ID = 'basic_renaming'
    HASH_ONE = 'hash_def_one_renaming'
    HASH_TWO = 'hash_def_two_renaming'
    
    def all(self):
        return [self.SCOPE_ID]
        
#         return [self.NONE, 
#                 self.NORMALIZED,
#                 self.SCOPE_ID,
#                 self.HASH_ONE,
#                 self.HASH_TWO]
    
    
class ConsistencyStrategies:
    LM = 'lm'
    LEN = 'len'
    FREQLEN = 'freqlen'

    def all(self):
        return [self.LM,
                self.FREQLEN]
        
    