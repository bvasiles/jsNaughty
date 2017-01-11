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
#         return [self.NORMALIZED]
        
        return [self.NONE, 
                self.NORMALIZED,
                self.SCOPE_ID,
                self.HASH_ONE,
                self.HASH_TWO]
    
    
class ConsistencyStrategies:
    LM = 'lm'
    LEN = 'len'
    FREQLEN = 'freqlen'

    def all(self):
        return [self.LM,
                self.FREQLEN]
        

import xmlrpclib

class MosesProxy:
    def __init__(self):
        RS = RenamingStrategies()
        
        self.proxies = {
                        RS.NONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"), 
                        RS.NORMALIZED:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40002/RPC2"),
                        RS.SCOPE_ID:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40003/RPC2"),
                        RS.HASH_ONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40004/RPC2"),
                        RS.HASH_TWO:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40005/RPC2")
                        }

    def getProxies(self):
        RS = RenamingStrategies()
        
        return [(RS.NONE, self.proxies[RS.NONE])] + \
            [(r_strategy, proxy) for (r_strategy, proxy) in self.proxies.items() 
             if not r_strategy==RS.NONE]

if __name__ == "__main__":
    for r_strategy, proxy in MosesProxy().getProxies():
        print r_strategy, proxy
        
    