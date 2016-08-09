import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst, \
                    UnuglifyJS, JSNice

from renamingStrategies import renameUsingScopeId, renameUsingHashAllPrec, \
                                renameUsingHashDefLine

from folderManager import Folder
import shutil


#class TimeExceededError(Exception): pass
#def timeout(signum, frame):
#    raise TimeExceededError, "Timed Out"


#import signal
##SIGALRM is only usable on a unix platform
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

    try:
        os.remove('tmp_%d.u.a.js' % pid)
    except OSError:
        pass
    
    try:
        os.remove('tmp_%d.u.a.js' % pid)
    except OSError:
        pass


def processFile(l):
    
    js_file_path = l[0]
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
    pid = int(multiprocessing.current_process().ident)
    
    try:
        # Temp files to be created during processing
        path_tmp = 'tmp_%d.js' % (pid)
        path_tmp_b = 'tmp_%d.b.js' % (pid)
        path_tmp_u = 'tmp_%d.u.js' % (pid)
        path_tmp_b_a = 'tmp_%d.b.a.js' % (pid)
        path_tmp_u_a = 'tmp_%d.u.a.js' % (pid)
        
        path_orig = '%s.js' % (base_name)
        path_ugly = '%s.u.js' % (base_name)
        path_jsn = '%s.n2p.js' % (base_name)
        path_unugly = '%s.nice.js' % (base_name)
        
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
        
        # Store uglified version
        ok = clear.run(path_tmp_u_a, os.path.join(output_path, path_ugly))
        
        ok = clear.run(path_tmp_b_a, os.path.join(output_path, path_orig))
        
        # Run the JSNice from http://www.nice2predict.org
        unuglifyJS = UnuglifyJS()
        (unuglifyjs_ok, out, err) = unuglifyJS.run(path_tmp_b_a, path_unugly)
        ok = clear.run(path_unugly, os.path.join(output_path, path_unugly))
    
        # Run the JSNice from http://www.jsnice.org
        jsNice = JSNice()
        (jsnice_ok, out, err) = jsNice.run(path_tmp_b_a, path_jsn)
        ok = clear.run(path_jsn, os.path.join(output_path, path_jsn))
        
        
        cleanup(pid)
        return (js_file_path, None, 'OK')

#         
#         
#         # Compute scoping: name2scope is a dictionary where keys
#         # are (name, start_index) tuples and values are scope identifiers. 
#         # Note: start_index is a flat (unidimensional) index, 
#         # not a (line_chr_idx, col_chr_idx) index.
#         try:
#             scopeAnalyst = ScopeAnalyst(os.path.join(
#                                  os.path.dirname(os.path.realpath(__file__)), 
#                                  path_tmp_u_a))
#             _name2defScope = scopeAnalyst.resolve_scope()
#             _isGlobal = scopeAnalyst.isGlobal
#             _name2useScope = scopeAnalyst.resolve_use_scope()
#         except:
#             cleanup(pid)
#             return (js_file_path, None, 'ScopeAnalyst fail')
#         
#         orig = []
#         no_renaming = []
#         for line_idx, line in enumerate(iBuilder_ugly.tokens):
#             orig.append(' '.join([t for (_tt,t) in \
#                                   iBuilder_clear.tokens[line_idx]]) + "\n")
#             no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
#             
#         # Simple renaming: disambiguate overloaded names using scope id
#         basic_renaming = renameUsingScopeId(scopeAnalyst, iBuilder_ugly)
#         
#         # More complicated renaming: collect the context around  
#         # each name (global variables, API calls, punctuation)
#         # and build a hash of the concatenation.
#         hash_renaming = renameUsingHashAllPrec(scopeAnalyst, 
#                                                iBuilder_ugly,
#                                                debug=False)
#         
#         hash_def_one_renaming = renameUsingHashDefLine(scopeAnalyst, 
#                                                    iBuilder_ugly, 
#                                                    twoLines=False,
#                                                    debug=False)
# 
#         hash_def_two_renaming = renameUsingHashDefLine(scopeAnalyst, 
#                                                    iBuilder_ugly, 
#                                                    twoLines=True,
#                                                    debug=False)
# 
#         cleanup(pid)
#         return (js_file_path,
#                 orig, 
#                 no_renaming, 
#                 basic_renaming, 
#                 hash_renaming,
#                 hash_def_one_renaming,
#                 hash_def_two_renaming)
        
         
    #except TimeExceededError, e:
    #    cleanup(pid)
    #    return (js_file_path, None, str(e))

    except Exception, e:
        cleanup(pid)
        return (js_file_path, None, str(e))
    
    
corpus_root = os.path.abspath(sys.argv[1])
testing_sample_path = sys.argv[2]

output_path = Folder(sys.argv[3]).create()
num_threads = int(sys.argv[4])

f1 = 'corpus.orig.js'
f2 = 'corpus.no_renaming.js'
f3 = 'corpus.basic_renaming.js'
f4 = 'corpus.hash_renaming.js'
f5 = 'corpus.hash_def_one_renaming.js'
f6 = 'corpus.hash_def_two_renaming.js'
flog = 'log_test_' + os.path.basename(corpus_root)
#f1, f2, f3, f4, f5, f6, 
try:
    for f in [flog]:
        os.remove(os.path.join(output_path, f))
except:
    pass


# inputs = Folder(corpus_root).fullFileNames("*.js")

with open(testing_sample_path, 'r') as f:

    reader = UnicodeReader(f)

    pool = multiprocessing.Pool(processes=num_threads)
    
    for result in pool.imap_unordered(processFile, reader):
      
        with open(os.path.join(output_path, flog), 'a') as g:
            writer = UnicodeWriter(g)
    
            if result[1] is not None:
                writer.writerow(result)
            else:
                writer.writerow([result[0], result[2]])
            

