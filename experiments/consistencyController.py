'''
Created on Feb 4, 2017

@author: Bogdan Vasilescu
'''

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))

from tools import ConsistencyStrategies
from tools import ConsistencyResolver, \
                        LenConsistencyResolver, \
                        FreqLenConsistencyResolver, \
                        LMAvgConsistencyResolver, \
                        LMDropConsistencyResolver


class ConsistencyController:
    
    def __init__(self, 
                 debug_mode):
        self.CS = ConsistencyStrategies()
        self.debug_mode = debug_mode
    
    
    def computeRenaming(self,
                        strategy,
                        name_candidates,
                        name_positions,
                        use_scopes,
                        iBuilder=None,
                        lm_path=None):
        
        if strategy == self.CS.LM:
            worker = LMAvgConsistencyResolver(self.debug_mode,
                                              lm_path)

        elif strategy == self.CS.LMDROP:
            worker = LMDropConsistencyResolver(self.debug_mode,
                                               lm_path)
            
        elif strategy == self.CS.FREQLEN:
            worker = FreqLenConsistencyResolver(self.debug_mode)
            
        elif strategy == self.CS.LEN:
            worker = LenConsistencyResolver(self.debug_mode)
            
        else:
            worker = ConsistencyResolver(self.debug_mode)
        
        return worker.computeRenaming(name_candidates, 
                                      name_positions,
                                      use_scopes,
                                      iBuilder)
