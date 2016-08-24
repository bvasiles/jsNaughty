import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner

from folderManager import Folder


#class TimeExceededError(Exception): pass
#def timeout(signum, frame):
#    raise TimeExceededError, "Timed Out"


#import signal
#SIGALRM is only usable on a unix platform
#signal.signal(signal.SIGALRM, timeout)


def cleanup(pid):
    try:
        os.remove('tmp_%d.js' % pid)
    except OSError:
        pass
    
    try:
        os.remove('tmp_%d.b.js' % pid)
    except OSError:
        pass
    
    try:
        os.remove('tmp_%d.b.a.js' % pid)
    except OSError:
        pass
    
    try:
        os.remove('tmp_%d.u.js' % pid)
    except OSError:
        pass
    
    try:
        os.remove('tmp_%d.u.a.js' % pid)
    except OSError:
        pass



def processFile(l):
    
    [js_file_path] = l
    
    pid = int(multiprocessing.current_process().ident)
    
    try:
        # Timeout after 20 minutes
        #signal.alarm(1200)
        
        # Temp files to be created during processing
        path_tmp = 'tmp_%d.js' % pid
        path_tmp_b = 'tmp_%d.b.js' % pid
        path_tmp_u = 'tmp_%d.u.js' % pid
        path_tmp_b_a = 'tmp_%d.b.a.js' % pid
        path_tmp_u_a = 'tmp_%d.u.a.js' % pid
        
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
        
        # Minify
        ugly = Uglifier()
        ok = ugly.run(path_tmp_b, path_tmp_u)
        
        if not ok:
            cleanup(pid)
            return (js_file_path, None, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            tok_clear = Lexer(path_tmp_b).tokenList
            tok_ugly = Lexer(path_tmp_u).tokenList
        except:
            cleanup(pid)
            return (js_file_path, None, 'Lexer fail')
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(pid)
            return (js_file_path, None, 'Num tokens mismatch')
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            # This is already the baseline corpus, no (smart) renaming yet
            aligner.align(path_tmp_b, path_tmp_u)
        except:
            cleanup(pid)
            return (js_file_path, None, 'Aligner fail')
        
        try:
            iBuilder_clear = IndexBuilder(Lexer(path_tmp_b_a).tokenList)
            iBuilder_ugly = IndexBuilder(Lexer(path_tmp_u_a).tokenList)
        except:
            cleanup(pid)
            return (js_file_path, None, 'IndexBuilder fail')
                
        orig = []
        for line_idx, _line in enumerate(iBuilder_ugly.tokens):
            orig.append(' '.join([t for (_tt,t) in \
                                  iBuilder_clear.tokens[line_idx]]) + "\n")

        cleanup(pid)
        return (js_file_path,
                orig)
        
         
    #except TimeExceededError, e:
    #    cleanup(pid)
    #    return (js_file_path, None, str(e))

    except Exception, e:
        cleanup(pid)
        return (js_file_path, None, str(e))
    
    
corpus_root = os.path.abspath(sys.argv[1])
training_sample_path = sys.argv[2]

output_path = Folder(sys.argv[3]).create()

with open(training_sample_path, 'r') as f, \
        open(os.path.join(output_path,
               'log_' + os.path.basename(training_sample_path)), 'w') as g:
    reader = UnicodeReader(f)
    writer = UnicodeWriter(g)

    f1 = 'corpus.orig.js'
    
    try:
        for f in [f1]:
            os.remove(os.path.join(output_path, f))
    except:
        pass

    pool = multiprocessing.Pool(processes=32)

    for result in pool.imap_unordered(processFile, reader):
        
        if result[1] is not None:
            (js_file_path,
             orig) = result
          
            try:
                with open(os.path.join(output_path, f1), 'a') \
                            as f_orig:
                    f_orig.writelines(orig)
                    
                writer.writerow([js_file_path, 'OK'])
        
            except Exception, e:
                writer.writerow([js_file_path, str(e)])
                
        else:
            writer.writerow([result[0], result[2]])

