'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, IndexBuilder, Beautifier, \
                    WebScopeAnalyst, WebPreprocessor, \
                    WebLexer, PreRenamer, RenamingStrategies

from folderManager import Folder


def processFile(l):
    
    js_file_path = l[0]
    
#     if True:
    try:
        js_text = open(os.path.join(corpus_root, js_file_path), 'r').read()
        
        # Strip comments, replace literals, etc
        try:
            prepro = WebPreprocessor(js_text)
            prepro_text = str(prepro)
        except:
            return (js_file_path, None, 'Preprocessor fail')
        
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        (ok, beautified_text, _err) = clear.web_run(prepro_text)
        if not ok:
            return (js_file_path, None, 'Beautifier fail')
        
            
        # Minify
        ugly = Uglifier()
        (ok, minified_text, _err) = ugly.web_run(beautified_text)
        if not ok:
            return (js_file_path, None, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            lex_clear = WebLexer(beautified_text)
            tok_clear = lex_clear.tokenList
            
            lex_ugly = WebLexer(minified_text)
            tok_ugly = lex_ugly.tokenList
        except:
            return (js_file_path, None, 'Lexer fail')
       
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            return (js_file_path, None, 'Num tokens mismatch')
        
        
#         # Align minified and clear files, in case the beautifier 
#         # did something weird
#         try:
#             aligner = Aligner()
#             # This is already the baseline corpus, no (smart) renaming yet
#             aligner.align(temp_files['path_tmp_b'], 
#                           temp_files['path_tmp_u'])
#         except:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Aligner fail')
        
        
        if beautified_text == minified_text:
            return (js_file_path, None, 'Not minified')

        
        try:
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
            return (js_file_path, None, 'IndexBuilder fail')
        
        
        try:
            scopeAnalyst = WebScopeAnalyst(minified_text)
        except:
            return (js_file_path, None, 'ScopeAnalyst fail')

        processed = []
         
        # Try different renaming strategies (hash, etc)
        for r_strategy in RS.all():
        
            try:
#             if True:
                # Rename input prior to translation
                preRen = PreRenamer()
                after_text = preRen.rename(r_strategy, 
                                          iBuilder_ugly,
                                          scopeAnalyst)
                
                (ok, beautified_after_text, _err) = clear.web_run(after_text)
                if not ok:
                    return (js_file_path, None, 'Beautifier fail')
                
                processed.append((r_strategy, beautified_after_text))
                
            except:
                return (js_file_path, None, 'Renaming fail')
            
        
        with open(os.path.join(output_path, 'orig', js_file_path), 'w') as f:
            f.write(beautified_text)
        
        for (r_strategy, text) in processed:
            with open(os.path.join(output_path, r_strategy, js_file_path), 'w') as f:
                f.write(text)
        
        return (js_file_path, 'OK', None)


    except Exception, e:
        return (js_file_path, None, str(e).replace("\n", ""))
    
    

if __name__=="__main__":

    corpus_root = os.path.abspath(sys.argv[1])
    sample_path = os.path.abspath(sys.argv[2])
    
    output_path = Folder(sys.argv[3]).create()
    num_threads = int(sys.argv[4])
    
    flog = 'log_renameAndUglifyMem_' + os.path.basename(corpus_root)

    RS = RenamingStrategies()
    
    Folder(os.path.join(output_path, 'orig')).create()
    for r_strategy in RS.all():
        Folder(os.path.join(output_path, r_strategy)).create()
    
    
    with open(sample_path, 'r') as f:
    
        reader = UnicodeReader(f)
    
        pool = multiprocessing.Pool(processes=num_threads)
        
#         result = processFile(reader.next())
#         if True:
        for result in pool.imap_unordered(processFile, reader):
        
            with open(os.path.join(output_path, flog), 'a') as g:
                writer = UnicodeWriter(g)
         
                if result[1] is not None:
                    js_file_path, ok, _x = result
                    writer.writerow([js_file_path, ok])
                    
                else:
                    writer.writerow([result[0], result[2]])
             

