import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import IndexBuilder, Lexer, ScopeAnalyst
# from pygments.token import Token, is_token_subtype



def processFile(row):
    
    js_file_path = row[0]
    status = row[1]
    if not status == 'OK':
        return (js_file_path, None, 'Incomplete')
    
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
    temp_files = {'path_orig': os.path.join(results_root, 
                                            '%s.js' % base_name),
                  'path_ugly': os.path.join(results_root, 
                                            '%s.u.js' % base_name),
                  'path_unugly': os.path.join(results_root, 
                                              '%s.n2p.js' % base_name),
                  'path_hash_lm': os.path.join(results_root, 
                                               '%s.hash_def_one_renaming.lm.js' % base_name)}

    try:
        
        def load(pth):
            lexer = Lexer(pth)
            iBuilder = IndexBuilder(lexer.tokenList)
 
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 pth))
            
            return (iBuilder, scopeAnalyst)

        try:
            (iBuilder_orig, scopeAnalyst_orig) = load(temp_files['path_orig'])
        except:
            return (js_file_path, None, 'Orig fail')
        
#         try:
#             (iBuilder_ugly, scopeAnalyst_ugly) = load(temp_files['path_ugly'])
#         except:
#             return (js_file_path, None, 'Ugly fail')
#         
#         try:
#             (iBuilder_unugly, scopeAnalyst_unugly) = load(temp_files['path_unugly'])
#         except:
#             return (js_file_path, None, 'N2P fail')
#         
#         try:
#             (iBuilder_hash, scopeAnalyst_hash) = load(temp_files['path_hash_lm'])
#         except:
#             return (js_file_path, None, 'Hash fail')
        
        
        name2defScope_orig = scopeAnalyst_orig.resolve_scope()
#         scopes = set(name2defScope.values())
        isGlobal_orig = scopeAnalyst_orig.isGlobal
        nameDefScope2pos_orig = scopeAnalyst_orig.nameDefScope2pos
        nameOrigin_orig = scopeAnalyst_orig.nameOrigin
        
        print js_file_path
        
        for (name, def_scope) in nameOrigin_orig.iterkeys():
            pos = nameDefScope2pos_orig[(name, def_scope)]
            
            (lin,col) = iBuilder_orig.revFlatMat[pos]
            tok_scope_orig = iBuilder_orig.revTokMap[(lin,col)]
            
            glb_orig = isGlobal_orig.get((name, pos), True)
            
            lc_list = [iBuilder_orig.revTokMap[iBuilder_orig.revFlatMat[pos]] 
                       for (t,pos) in name2defScope_orig.keys()  
                       if name2defScope_orig[(t,pos)] == def_scope]
            
            print '  ', name, tok_scope_orig, glb_orig, lc_list
        
        
        print '\n\n'
        return (js_file_path, 'OK')
        

    except Exception, e:
        return (js_file_path, None, str(e).replace("\n", ""))
    
    
    
results_root = os.path.abspath(sys.argv[1])
file_list_path = os.path.abspath(sys.argv[2])
num_threads = int(sys.argv[3])


flog = 'log_sanity'
try:
    for f in [flog]:
        os.remove(os.path.join(results_root, f))
except:
    pass


with open(file_list_path, 'r') as f:

    reader = UnicodeReader(f)

#     result = processFile(reader.next())

    pool = multiprocessing.Pool(processes=num_threads)
    
    for result in pool.imap_unordered(processFile, reader):
    
        with open(os.path.join(results_root, flog), 'a') as g:
            writer = UnicodeWriter(g)
     
            if result[1] is not None:
                js_file_path, ok = result
                writer.writerow([js_file_path, ok])
            else:
                writer.writerow([result[0], result[2]])
             

