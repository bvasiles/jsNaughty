import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, Preprocessor, IndexBuilder, JSNice, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst, Normalizer

from renamingStrategies import renameUsingHashDefLine, \
            renameUsingScopeId, renameUsingHashAllPrec
                                

from folderManager import Folder


def tryRemove(pth):
    try:
        os.remove(pth)
    except OSError:
        pass

    
def cleanup(temp_files):
    for file_path in temp_files.itervalues():
        tryRemove(file_path)
    


def processFile(l):
    
    js_file_path = l[0]
    
    pid = int(multiprocessing.current_process().ident)
    
    # Temp files to be created during processing
    temp_files = {'path_tmp': 'tmp_%d.js' % pid,
                  'path_tmp_b': 'tmp_%d.b.js' % pid,
                  'path_tmp_b_n': 'tmp_%d.b.n.js' % pid,
                  'path_tmp_u': 'tmp_%d.u.js' % pid,
                  'path_tmp_u_n': 'tmp_%d.u.n.js' % pid,
                  'path_tmp_b_a': 'tmp_%d.b.a.js' % pid,
                  'path_tmp_u_a': 'tmp_%d.u.a.js' % pid}
    
    try:        
        # Strip comments, replace literals, etc
        try:
            prepro = Preprocessor(os.path.join(corpus_root, js_file_path))
            prepro.write_temp_file(temp_files['path_tmp'])
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'Preprocessor fail')
        
        
        # Pass through beautifier to fix layout:
        # - once through JSNice without renaming
#         jsNiceBeautifier = JSNice(flags=['--no-types', '--no-rename'])
#         
#         (ok, _out, _err) = jsNiceBeautifier.run(temp_files['path_tmp'], 
#                                                 temp_files['path_tmp_b_n'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'JSNice Beautifier fail')
        
        
#         # - and another time through uglifyjs pretty print only 
#         clear = Beautifier()
#         ok = clear.run(temp_files['path_tmp_b_n'], 
#                        temp_files['path_tmp_b'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Beautifier fail')
        
#         # JSNice is down! 
        clear = Beautifier()
        ok = clear.run(temp_files['path_tmp'], 
                       temp_files['path_tmp_b'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
        
        
        # Minify
        ugly = Uglifier()
        ok = ugly.run(temp_files['path_tmp_b'], 
                      temp_files['path_tmp_u'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Uglifier fail')
        
        
        # Num tokens before vs after
        try:
            tok_clear = Lexer(temp_files['path_tmp_b']).tokenList
            tok_ugly = Lexer(temp_files['path_tmp_u']).tokenList
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'Lexer fail')
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(temp_files)
            return (js_file_path, None, 'Num tokens mismatch')
        
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            # This is already the baseline corpus, no (smart) renaming yet
            aligner.align(temp_files['path_tmp_b'], 
                          temp_files['path_tmp_u'])
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'Aligner fail')
        
#         try:
        lex_clear = Lexer(temp_files['path_tmp_b_a'])
        iBuilder_clear = IndexBuilder(lex_clear.tokenList)
        
        lex_ugly = Lexer(temp_files['path_tmp_u_a'])
        iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
#         except:
#             cleanup(temp_files)
#             return (js_file_path, None, 'IndexBuilder fail')
        
        
        
        # Normalize
        norm = Normalizer()
        ok = norm.run(os.path.join(os.path.dirname(os.path.realpath(__file__)), 
                                 temp_files['path_tmp_b']), 
                      temp_files['path_tmp_u_n'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Normalizer fail')
        
#         try:
        lex_norm = Lexer(temp_files['path_tmp_u_n'])
        iBuilder_norm = IndexBuilder(lex_norm.tokenList)
#         except:
#             cleanup(temp_files)
#             return (js_file_path, None, 'IndexBuilder fail')
        
        for line_idx, line in enumerate(iBuilder_norm.tokens):
            normalized.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        
        
        # Compute scoping: name2scope is a dictionary where keys
        # are (name, start_index) tuples and values are scope identifiers. 
        # Note: start_index is a flat (unidimensional) index, 
        # not a (line_chr_idx, col_chr_idx) index.
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 temp_files['path_tmp_u_a']))
#             _name2defScope = scopeAnalyst.resolve_scope()
#             _isGlobal = scopeAnalyst.isGlobal
#             _name2useScope = scopeAnalyst.resolve_use_scope()
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'ScopeAnalyst fail')
        
        orig = []
        no_renaming = []
        
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            orig.append(' '.join([t for (_tt,t) in \
                                  iBuilder_clear.tokens[line_idx]]) + "\n")
            
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
            
#         # Simple renaming: disambiguate overloaded names using scope id
        basic_renaming = renameUsingScopeId(scopeAnalyst, 
                                            iBuilder_ugly)
        
        # More complicated renaming: collect the context around  
        # each name (global variables, API calls, punctuation)
        # and build a hash of the concatenation.
        hash_renaming = renameUsingHashAllPrec(scopeAnalyst, 
                                                iBuilder_ugly,
                                                debug=False)
        
        hash_def_one_renaming = renameUsingHashDefLine(scopeAnalyst, 
                                                   iBuilder_ugly, 
                                                   twoLines=False,
                                                   debug=False)

        hash_def_two_renaming = renameUsingHashDefLine(scopeAnalyst, 
                                                    iBuilder_ugly, 
                                                    twoLines=True,
                                                    debug=False)

        cleanup(temp_files)
        return (js_file_path,
                orig, 
                no_renaming, 
                basic_renaming,
                normalized, 
                hash_renaming,
                hash_def_one_renaming,
                hash_def_two_renaming)
        
    except Exception, e:
        cleanup(temp_files)
        return (js_file_path, None, str(e))
    
    
corpus_root = os.path.abspath(sys.argv[1])
training_sample_path = os.path.abspath(sys.argv[2])

output_path = Folder(sys.argv[3]).create()
num_threads = int(sys.argv[4])

Folder(os.path.join(output_path, 'orig')).create()
Folder(os.path.join(output_path, 'no_renaming')).create()
Folder(os.path.join(output_path, 'basic_renaming')).create()
Folder(os.path.join(output_path, 'normalized')).create()
Folder(os.path.join(output_path, 'hash_renaming')).create()
Folder(os.path.join(output_path, 'hash_def_one_renaming')).create()
Folder(os.path.join(output_path, 'hash_def_two_renaming')).create()

flog = 'log_' + os.path.basename(training_sample_path)

try:
    for f in [flog]: #f3, f4, f6]:
        os.remove(os.path.join(output_path, f))
except:
    pass

with open(training_sample_path, 'r') as f, \
        open(os.path.join(output_path, flog), 'w') as g:

    reader = UnicodeReader(f)
    writer = UnicodeWriter(g)

#     pool = multiprocessing.Pool(processes=num_threads)

#     for result in pool.imap_unordered(processFile, reader):
    for row in reader:
        result = processFile(row)
      
        if result[1] is not None:
            (js_file_path,
             orig, 
             no_renaming, 
             basic_renaming, 
             normalized,
             hash_renaming,
             hash_def_one_renaming,
             hash_def_two_renaming) = result
            
            try:
                with open(os.path.join(output_path, 'orig', js_file_path), 'w') as f_orig:
                    f_orig.writelines(orig)
                
                with open(os.path.join(output_path, 'no_renaming', js_file_path), 'w') as f_no_renaming:
                    f_no_renaming.writelines(no_renaming)
                
                with open(os.path.join(output_path, 'basic_renaming', js_file_path), 'w') as f_basic_renaming:
                    f_basic_renaming.writelines(basic_renaming)
                
                with open(os.path.join(output_path, 'normalized', js_file_path), 'w') as f_normalized:
                    f_normalized.writelines(normalized)
                    
                with open(os.path.join(output_path, 'hash_renaming', js_file_path), 'w') as f_hash_renaming:
                    f_hash_renaming.writelines(hash_renaming)
                    
                with open(os.path.join(output_path, 'hash_def_one_renaming', js_file_path), 'w') as f_hash_def_one_renaming:
                    f_hash_def_one_renaming.writelines(hash_def_one_renaming)
                    
                with open(os.path.join(output_path, 'hash_def_one_renaming', js_file_path), 'w') as f_hash_def_two_renaming:
                    f_hash_def_two_renaming.writelines(hash_def_two_renaming)
                                            
                
                writer.writerow([js_file_path, 'OK'])
    
            except Exception, e:
                writer.writerow([js_file_path, str(e)])
            
        else:
            writer.writerow([result[0], result[2]])

