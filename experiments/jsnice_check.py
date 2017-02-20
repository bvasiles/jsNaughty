import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import IndexBuilder, Lexer, ScopeAnalyst


def check(iBuilder_orig, scopeAnalyst_orig, iBuilder_renamed, scopeAnalyst_renamed):

    data = {}
    
#         print '\n', js_file_path
    
    name2defScope_orig = scopeAnalyst_orig.resolve_scope()
    isGlobal_orig = scopeAnalyst_orig.isGlobal
    nameDefScope2pos_orig = scopeAnalyst_orig.nameDefScope2pos
    nameOrigin_orig = scopeAnalyst_orig.nameOrigin
    
    for (name, def_scope) in nameOrigin_orig.iterkeys():
        pos = nameDefScope2pos_orig[(name, def_scope)]
        
        (lin,col) = iBuilder_orig.revFlatMat[pos]
        tok_scope_orig = iBuilder_orig.revTokMap[(lin,col)]
        
        glb_orig = isGlobal_orig.get((name, pos), True)
        
        lc_list = [iBuilder_orig.revTokMap[iBuilder_orig.revFlatMat[pos]] 
                   for (t,pos) in name2defScope_orig.keys()  
                   if name2defScope_orig[(t,pos)] == def_scope]
        
        data[tok_scope_orig] = (name, glb_orig, lc_list)
#             print '  ', name, tok_scope_orig, glb_orig, lc_list
    
    
    ok = True

    name2defScope = scopeAnalyst_renamed.resolve_scope()
    isGlobal = scopeAnalyst_renamed.isGlobal
    nameDefScope2pos = scopeAnalyst_renamed.nameDefScope2pos
    nameOrigin = scopeAnalyst_renamed.nameOrigin
    
    for (name, def_scope) in nameOrigin.iterkeys():
        
        if name != 'TOKEN_LITERAL_NUMBER' and \
                name != 'TOKEN_LITERAL_STRING':
        
            pos = nameDefScope2pos[(name, def_scope)]
            
            (lin,col) = iBuilder_renamed.revFlatMat[pos]
            tok_scope = iBuilder_renamed.revTokMap[(lin,col)]
            
            glb = isGlobal.get((name, pos), True)
            
#                     print ' ', name, pos, (lin,col), tok_scope, glb
            
            lc_list = [iBuilder_renamed.revTokMap[iBuilder_renamed.revFlatMat[pos]] 
                       for (t,pos) in name2defScope.keys()  
                       if name2defScope[(t,pos)] == def_scope]        
        
            (_name_orig, glb_orig, lc_list_orig) = data[tok_scope]
            if not (glb_orig == glb and 
                    set(lc_list_orig) == set(lc_list)):
#                         print '  **', name,  lc_list, lc_list_orig
                ok = False
    
    return ok
