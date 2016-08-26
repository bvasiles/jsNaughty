import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, IndexBuilder, JSNice, \
                    Beautifier, Lexer, Aligner, \
                    Normalizer, Dos2Unix
from pygments.token import Token, is_token_subtype
from folderManager import Folder


def tryRemove(pth):
    try:
        os.remove(pth)
    except OSError:
        pass

    
def cleanup(temp_files):
    for file_path in temp_files.itervalues():
        tryRemove(file_path)
    

def cleanupProcessed(base_name):
    temp_files = {'path_orig': os.path.join(output_path, '%s.js' % base_name),
                  'path_ugly': os.path.join(output_path, '%s.u.js' % base_name)}
    for file_path in temp_files.itervalues():
        tryRemove(file_path)


def processFile(row):
    
    js_file_path = os.path.join(corpus_root, row[0])
    
    pid = int(multiprocessing.current_process().ident)
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
    # Temp files to be created during processing
    temp_files = {'path_tmp': 'tmp_%d.js' % pid,
                  'path_tmp_b': 'tmp_%d.b.js' % pid,
                  'path_tmp_b_a': 'tmp_%d.b.a.js' % pid,
                  'path_tmp_u': 'tmp_%d.u.js' % pid,
                  'path_tmp_u_a': 'tmp_%d.u.a.js' % pid}

    
    try:        
        # Pass through beautifier to fix layout:
        # - once through JSNice without renaming
        jsNiceBeautifier = JSNice(flags=['--no-types', '--no-rename'])
        
        (ok, _out, _err) = jsNiceBeautifier.run(js_file_path,
                                               temp_files['path_tmp'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, False, 'JSNice Beautifier fail')


        # Weird JSNice renamings despite --no-rename
        try:
            before = set([token for (token, token_type) in 
                          Lexer(js_file_path).tokenList
                          if is_token_subtype(token_type, Token.Name)]) 
            after = set([token for (token, token_type) in 
                          Lexer(temp_files['path_tmp']).tokenList
                          if is_token_subtype(token_type, Token.Name)])
             
            if not before == after:
                return (js_file_path, False, 'Weird JSNice renaming')
             
        except:
            cleanup(temp_files)
            return (js_file_path, False, 'Lexer fail')
        
        
        # - and another time through uglifyjs pretty print only 
        clear = Beautifier()
        ok = clear.run(temp_files['path_tmp'], 
                       temp_files['path_tmp_b'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, False, 'Beautifier fail')
        
        
        # Minify
        ugly = Uglifier()
        ok = ugly.run(temp_files['path_tmp_b'], 
                      temp_files['path_tmp_u'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, False, 'Uglifier fail')
        
        
        # Num tokens before vs after
        try:
            tok_clear = Lexer(temp_files['path_tmp_b']).tokenList
            tok_ugly = Lexer(temp_files['path_tmp_u']).tokenList
        except:
            cleanup(temp_files)
            return (js_file_path, False, 'Lexer fail')
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(temp_files)
            return (js_file_path, False, 'Num tokens mismatch')
        
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            # This is already the baseline corpus, no (smart) renaming yet
            aligner.align(temp_files['path_tmp_b'], 
                          temp_files['path_tmp_u'])
        except:
            cleanup(temp_files)
            return (js_file_path, False, 'Aligner fail')
        
        
        # Check if minification resulted in any change
        # It's not very interesting otherwise    
        if open(temp_files['path_tmp_b_a']).read() == \
                open(temp_files['path_tmp_u_a']).read():
            cleanup(temp_files)
            return (js_file_path, False, 'Not minified')

        
        try:
            lex_ugly = Lexer(temp_files['path_tmp_u_a'])
            _iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
            cleanup(temp_files)
            return (js_file_path, False, 'IndexBuilder fail')

        
        # Store original and uglified versions
        ok = clear.run(temp_files['path_tmp_b_a'], 
                       temp_files['path_orig'])
        if not ok:
            cleanup(temp_files)
            cleanupProcessed(base_name)
            return (js_file_path, False, 'Beautifier fail')
        
        ok = clear.run(temp_files['path_tmp_u_a'], 
                       temp_files['path_ugly'])
        if not ok:
            cleanup(temp_files)
            cleanupProcessed(base_name)
            return (js_file_path, False, 'Beautifier fail')
        
        
        
        cleanup(temp_files)
        return (js_file_path, True, 'OK')
        
    except Exception, e:
        cleanup(temp_files)
        return (js_file_path, False, str(e))
    
    
corpus_root = os.path.abspath(sys.argv[1])
training_sample_path = os.path.abspath(sys.argv[2])

output_path = Folder(sys.argv[3]).create()
num_threads = int(sys.argv[4])

flog = 'log_' + os.path.basename(training_sample_path)

try:
    for f in [flog]:
        os.remove(os.path.join(output_path, f))
except:
    pass


with open(training_sample_path, 'r') as f, \
        open(os.path.join(output_path, flog), 'w') as g:

    reader = UnicodeReader(f)
    writer = UnicodeWriter(g)

    pool = multiprocessing.Pool(processes=num_threads)

    for result in pool.imap_unordered(processFile, reader):
      
            if result[1]:
                (js_file_path, ok, msg) = result
          
                writer.writerow([js_file_path, msg])
                
            else:
                writer.writerow([result[0], result[2]])

