import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Preprocessor, IndexBuilder, Beautifier, Lexer
from folderManager import Folder



def cleanup(pid):
    try:
        os.remove('tmp_%d.js' % pid)
    except OSError:
        pass
    
    try:
        os.remove('tmp_%d.b.js' % pid)
    except OSError:
        pass
    


def processFile(l):
    
    js_file_path = l[0]
    
    pid = int(multiprocessing.current_process().ident)
    
    try:
        # Temp files to be created during processing
        path_tmp = 'tmp_%d.js' % pid
        path_tmp_b = 'tmp_%d.b.js' % pid
        
        # Strip comments, replace literals, etc
        try:
            prepro = Preprocessor(os.path.join(corpus_root, js_file_path))
            prepro.write_temp_file(path_tmp)
        except:
            cleanup(pid)
            return (js_file_path, None, 'Preprocessor fail')
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        ok = clear.run(path_tmp, path_tmp_b)
         
        if not ok:
            cleanup(pid)
            return (js_file_path, None, 'Beautifier fail')
        
        try:
            iBuilder_clear = IndexBuilder(Lexer(path_tmp_b).tokenList)
        except:
            cleanup(pid)
            return (js_file_path, None, 'IndexBuilder fail')

        
        n_lines = len(iBuilder_clear.tokens)
        max_line_len = max([len(l) for l in iBuilder_clear.tokens])
        
        
        cleanup(pid)
        return (js_file_path,
                n_lines, 
                max_line_len)
        
         
    except Exception, e:
        cleanup(pid)
        return (js_file_path, None, str(e))
    
    
corpus_root = os.path.abspath(sys.argv[1])
test_sample_path = sys.argv[2]

output_path = Folder(sys.argv[3]).create()
num_threads = int(sys.argv[4])

with open(test_sample_path, 'r') as f:

    reader = UnicodeReader(f)

    flog = 'log_' + os.path.basename(test_sample_path)
    try:
        for f in [flog]:
            os.remove(os.path.join(output_path, f))
    except:
        pass

    pool = multiprocessing.Pool(processes=num_threads)

    for result in pool.imap_unordered(processFile, reader):
        
        with open(os.path.join(output_path, flog), 'a') as g:
            writer = UnicodeWriter(g)
   
            if result[1] is not None:
                (js_file_path,
                 n_lines, 
                 max_line_len) = result
           
                writer.writerow([js_file_path, 'OK', n_lines, max_line_len])
         
            else:
                writer.writerow(result)

