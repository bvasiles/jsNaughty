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
from tools import Uglifier, Beautifier
from tools import IndexBuilder
from tools import Aligner
from tools import WebScopeAnalyst
from tools import WebLMPreprocessor
from tools import WebLexer
from tools import PreRenamer
from folderManager import Folder


def processFile(l):
    
    js_file_path = l[0]
    status = l[1]
    if status != 'OK':
        return (js_file_path, None, 'Skipped')
    
#     print js_file_path
    
#     if True:
    try:
        js_text = open(os.path.join(corpus_root, js_file_path), 'r').read()
#         js_text = open(js_file_path, 'r').read()
        
        # Strip comments, replace literals, etc
        try:
            prepro = WebLMPreprocessor(js_text)
            prepro_text = str(prepro)
        except:
            return (js_file_path, None, 'Preprocessor fail')
        
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        (ok, tmp_beautified_text, _err) = clear.web_run(prepro_text)
#         print 'Beautifier:', ok, _err
#         print tmp_beautified_text

        if not ok:
            return (js_file_path, None, 'Beautifier fail')
        
            
        # Minify
        ugly = Uglifier()
        (ok, tmp_minified_text, _err) = ugly.web_run(tmp_beautified_text)
#         print 'Uglifier:', ok, _err
#         print tmp_minified_text

        if not ok:
            return (js_file_path, None, 'Uglifier fail')

        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            (aligned_clear, aligned_minified) = aligner.web_align(WebLexer(tmp_beautified_text).tokenList,
                                                                 WebLexer(tmp_minified_text).tokenList)
        except:
            return (js_file_path, None, 'Aligner fail')

#         print '\nAligned clear:'
#         print aligned_clear
        
#         print '\nAligned ugly:'
#         print aligned_minified
        
        # Pass through beautifier to fix layout
        (ok, beautified_text, _err) = clear.web_run(aligned_clear)
#         print 'Beautifier after align:', ok, _err
        
        if not ok:
            return (js_file_path, None, 'Beautifier fail')
        
        (ok, minified_text, _err) = clear.web_run(aligned_minified)
#         print 'Uglifier after align:', ok, _err
        
        if not ok:
            return (js_file_path, None, 'Beautifier fail')

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
#                 print 'Beautifier after rename:', ok, _err
                if not ok:
                    return (js_file_path, None, 'Beautifier fail on hash')
                
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
    
    


class RenamingStrategies:
    NONE = 'no_renaming'
    NORMALIZED = 'normalized'
    SCOPE_ID = 'basic_renaming'
    HASH_ONE = 'hash_def_one_renaming'
    HASH_TWO = 'hash_def_two_renaming'
    
    def all(self):
        return [self.NONE, 
                self.HASH_ONE,
                self.HASH_TWO]
        
        
if __name__=="__main__":

    corpus_root = os.path.abspath(sys.argv[1])
    sample_path = os.path.abspath(sys.argv[2])
    
    output_path = Folder(sys.argv[3]).create()
    num_threads = int(sys.argv[4])
    
    log = 'log_renameAndUglify'

    RS = RenamingStrategies()
    
    Folder(os.path.join(output_path, 'orig')).create()
    for r_strategy in RS.all():
        Folder(os.path.join(output_path, r_strategy)).create()
    
    
    with open(sample_path, 'r') as f:
    
        reader = UnicodeReader(f)
    
        pool = multiprocessing.Pool(processes=num_threads)
        
#         result = processFile(reader.next())
#         if True:
#         for row in reader:
#             result = processFile(row)
        for result in pool.imap_unordered(processFile, reader):
        
            with open(os.path.join(output_path, log), 'a') as g:
                writer = UnicodeWriter(g)
         
                if result[1] is not None:
                    js_file_path, ok, _x = result
                    writer.writerow([js_file_path, ok])
                    
                else:
                    writer.writerow([result[0], result[2]])
             

