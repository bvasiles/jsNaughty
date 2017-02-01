'''
Created on Dec 22, 2016

@author: bogdanv
'''

class TranslationSummarizer:
    
#     def __init__(self):
        
        
    def compute_summary_scoped(self,
                        renaming_map,
                        name_candidates,
                        iBuilder,
                        scopeAnalyst):
        
        nc = []
        
        isGlobal = scopeAnalyst.isGlobal
        
#         print 'computing summary---------------'
#         for k,v in scopeAnalyst.nameDefScope2pos.iteritems():
#             print '   #', k, v
            
        for key, renaming in renaming_map.iteritems():
            
            (name, def_scope) = key
                
#             print ' * nameDefScope2pos', (name, def_scope)
            pos = scopeAnalyst.nameDefScope2pos[key]
                
            (lin,col) = iBuilder.revFlatMat[pos]
            (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
            
            nc.append( [def_scope, 
                        tok_lin, tok_col, 
                        isGlobal.get((name, pos), True),
                        renaming,
                        ','.join(name_candidates[(name, def_scope)].keys())] )
        
        return nc

    
    def compute_summary_unscoped(self,
                                 iBuilder,
                                 scopeAnalyst):
        
        nc = []
        
        nameOrigin = scopeAnalyst.nameOrigin
        isGlobal = scopeAnalyst.isGlobal
         
        for (name, def_scope) in nameOrigin.iterkeys():
            
            pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
            
            if not False: #isGlobal.get((name, pos), True):
                (lin,col) = iBuilder.revFlatMat[pos]
                (tok_lin, tok_col) = iBuilder.revTokMap[(lin,col)]
        
                nc.append( [def_scope, 
                            tok_lin, tok_col, 
                            isGlobal.get((name, pos), True),
                            name,
                            ''] )
                
        return nc
    
    
    