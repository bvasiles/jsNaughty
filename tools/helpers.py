'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''

from pygments.token import Token, is_token_subtype
import os


def prepHelpers(iBuilder, 
                   scopeAnalyst=None):

    # Collect names and their locations in various formats
    # that will come in handy later:
    
    # Which locations [(line number, index within line)] does
    # a variable name appear at?
    name_positions = {}
    
    # Which variable name is at a location specified by 
    # [line number][index within line]?
    position_names = {}
    
    use_scopes = {}
    for line_num, line in enumerate(iBuilder.tokens):
        position_names.setdefault(line_num, {})
        for line_idx, (token_type, token) in enumerate(line):
            
            if is_token_subtype(token_type, Token.Name):
                (l,c) = iBuilder.tokMap[(line_num, line_idx)]
                p = iBuilder.flatMap[(l,c)]
                
                if scopeAnalyst is not None:
                    name2defScope = scopeAnalyst.resolve_scope()
                    
                    use_scopes = scopeAnalyst.nameUseScopes
                    
#                     isGlobal = scopeAnalyst.isGlobal
#                     if not isGlobal.get((token, p), True):

                    try:
                        def_scope = name2defScope[(token, p)]
                        
                        name_positions.setdefault((token, def_scope), [])
                        name_positions[(token, def_scope)].append((line_num, line_idx))
                        position_names[line_num][line_idx] = (token, def_scope)
                    except KeyError:
                        pass

                else:
                    def_scope = None
                
                    name_positions.setdefault((token, def_scope), [])
                    name_positions[(token, def_scope)].append((line_num, line_idx))
                    position_names[line_num][line_idx] = (token, def_scope)

    return (name_positions, position_names, use_scopes)
    

def writeTmpLines(lines, 
                  out_file_path):
    
    js_tmp = open(out_file_path, 'w')
    js_tmp.write('\n'.join([' '.join([token for (_token_type, token) in line]) 
                            for line in lines]).encode('utf8'))
    js_tmp.write('\n')
    js_tmp.close()


def tryRemove(pth):
    try:
        os.remove(pth)
    except OSError:
        pass
  
      
def cleanup(temp_files):
    for file_path in temp_files: #.itervalues():
        tryRemove(file_path)
