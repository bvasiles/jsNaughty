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
        
#         return [self.NONE, 
#                 self.NORMALIZED,
#                 self.SCOPE_ID,
#                 self.HASH_ONE,
#                 self.HASH_TWO]
    
        return [self.NONE, 
                self.HASH_ONE]
#         return [self.HASH_ONE]
    
class ConsistencyStrategies:
    LM = 'lm'
    LMDROP = 'lmdrop'
    LEN = 'len'
    FREQLEN = 'freqlen'
    LOGMODEL = "logmodel"

    def all(self):
        return [self.FREQLEN,
		self.LM,
		self.LOGMODEL]
                #self.FREQLEN,
                #self.LM,
                #self.LMDROP,
                #self.LOGMODEL]
        

import xmlrpclib

class MosesProxy:
    def __init__(self):
        RS = RenamingStrategies()
        
        self.portLists = {"web" : [40021, 40022], "experiments": [40011,40012,40013,40014,40015]}
        #Todo: Bogdan -> I need your ini files for the experiment servers to be
        #added to this dictionary.
        #Note that these ini files MUST correspond with the order of ports in portLists
        self.iniFiles = {"web" : ["/data/bogdanv/deobfuscator/experiments/corpora/newcorpus.300k/train.no_renaming/tuning/moses.lm2.ini",
                                  "/data/bogdanv/deobfuscator/experiments/corpora/newcorpus.300k/train.hash_def_one_renaming/tuning/moses.lm2.ini"]}

# #         # Default, 300k corpus
#         self.proxies = {
#                         RS.NONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"), 
#                         RS.NORMALIZED:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40002/RPC2"),
#                         RS.SCOPE_ID:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40003/RPC2"),
#                         RS.HASH_ONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40004/RPC2"),
#                         RS.HASH_TWO:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40005/RPC2")
#                         }

#         # Tuned, 300k corpus
#         self.proxies = {
#                         RS.NONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40006/RPC2"), 
#                         RS.NORMALIZED:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40007/RPC2"),
#                         RS.SCOPE_ID:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40008/RPC2"),
#                         RS.HASH_ONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40009/RPC2"),
#                         RS.HASH_TWO:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40010/RPC2")
#                         }

        # Tuned, pruned LM, with literals, 300k corpus
        self.proxies = {
                        RS.NONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40011/RPC2"), 
                        RS.NORMALIZED:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40012/RPC2"),
                        RS.SCOPE_ID:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40013/RPC2"),
                        RS.HASH_ONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40014/RPC2"),
                        RS.HASH_TWO:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40015/RPC2")
                        }


#         # Pruned LM, with literals, 500k corpus
#         self.proxies = {
#                         RS.NONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40016/RPC2"), 
#                         RS.NORMALIZED:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40017/RPC2"),
#                         RS.SCOPE_ID:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40018/RPC2"),
#                         RS.HASH_ONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40019/RPC2"),
#                         RS.HASH_TWO:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40020/RPC2")
#                         }


        # Tuned, pruned LM, with literals, 300k corpus
        self.web_proxies = {
                        RS.NONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40021/RPC2"),
                        RS.HASH_ONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40022/RPC2"),
                        }



    def getProxies(self):
        RS = RenamingStrategies()
        
        return [(RS.NONE, self.proxies[RS.NONE])] + \
            [(r_strategy, self.proxies.get(r_strategy, self.proxies[RS.NONE])) 
                for r_strategy in RS.all() if not r_strategy==RS.NONE]


    def getWebProxies(self):
         RS = RenamingStrategies()
         return [(RS.NONE, self.web_proxies[RS.NONE]),(RS.HASH_ONE, self.web_proxies[RS.HASH_ONE])]


if __name__ == "__main__":
    for r_strategy, proxy in MosesProxy().getProxies():
        print r_strategy, proxy
        
    
