import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst

from renamingStrategies import renameUsingScopeId, renameUsingHashAllPrec, \
                                renameUsingHashDefLine


class TimeExceededError(Exception): pass
def timeout(signum, frame):
    raise TimeExceededError, "Timed Out"


class ContinueError(Exception): pass


import signal
#SIGALRM is only usable on a unix platform
signal.signal(signal.SIGALRM, timeout)


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
        signal.alarm(1200)
        
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
            raise Exception, (js_file_path, 'Preprocessor fail')
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        ok = clear.run(path_tmp, path_tmp_b)
         
        if not ok:
            cleanup(pid)
            raise Exception, (js_file_path, 'Beautifier fail')
        
        # Minify
        ugly = Uglifier()
        ok = ugly.run(path_tmp_b, path_tmp_u)
        
        if not ok:
            cleanup(pid)
            raise Exception, (js_file_path, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            tok_clear = Lexer(path_tmp_b).tokenList
            tok_ugly = Lexer(path_tmp_u).tokenList
        except:
            cleanup(pid)
            raise Exception, (js_file_path, 'Lexer fail')
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(pid)
            raise Exception, (js_file_path, 'Num tokens mismatch')
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            # This is already the baseline corpus, no (smart) renaming yet
            aligner.align(path_tmp_b, path_tmp_u)
        except:
            cleanup(pid)
            raise Exception, (js_file_path, 'Aligner fail')
        
        try:
            iBuilder_clear = IndexBuilder(Lexer(path_tmp_b_a).tokenList)
            iBuilder_ugly = IndexBuilder(Lexer(path_tmp_u_a).tokenList)
        except:
            cleanup(pid)
            raise Exception, (js_file_path, 'IndexBuilder fail')
        
        # Compute scoping: name2scope is a dictionary where keys
        # are (name, start_index) tuples and values are scope identifiers. 
        # Note: start_index is a flat (unidimensional) index, 
        # not a (line_chr_idx, col_chr_idx) index.
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(os.path.dirname(os.path.realpath(__file__)), path_tmp_u_a))
            _name2defScope = scopeAnalyst.resolve_scope()
            _isGlobal = scopeAnalyst.isGlobal
            _name2useScope = scopeAnalyst.resolve_use_scope()
        except:
            cleanup(pid)
            raise Exception, (js_file_path, 'ScopeAnalyst fail')
        
        orig = []
        no_renaming = []
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            orig.append(' '.join([t for (_tt,t) in \
                                  iBuilder_clear.tokens[line_idx]]) + "\n")
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
            
        # Simple renaming: disambiguate overloaded names using scope id
        basic_renaming = renameUsingScopeId(scopeAnalyst, iBuilder_ugly)
        
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

        cleanup(pid)
        return (js_file_path,
                orig, 
                no_renaming, 
                basic_renaming, 
                hash_renaming,
                hash_def_one_renaming,
                hash_def_two_renaming)
        
         
    except TimeExceededError, e:
        cleanup(pid)
        raise Exception, (js_file_path, str(e))

    
    
corpus_root = os.path.abspath(sys.argv[1])
training_sample_path = sys.argv[2]

training_sample = {}
with open(training_sample_path, 'r') as f, \
        open(('log_' + os.path.basename(training_sample_path)), 'w') as g:
    reader = UnicodeReader(f)
    writer = UnicodeWriter(g)
#     for row in reader:
#         training_sample[row[0]] = True

    f1 = 'corpus.orig.js'
    f2 = 'corpus.no_renaming.js'
    f3 = 'corpus.basic_renaming.js'
    f4 = 'corpus.hash_renaming.js'
    f5 = 'corpus.hash_def_one_renaming.js'
    f6 = 'corpus.hash_def_two_renaming.js'
    
    try:
        for f in [f1, f2, f3, f4, f5, f6]:
            os.remove(f)
    except:
        pass

    pool = multiprocessing.Pool(processes=8)

    for result in pool.imap(processFile, reader):
        try:
            (js_file_path,
             orig, 
             no_renaming, 
             basic_renaming, 
             hash_renaming,
             hash_def_one_renaming,
             hash_def_two_renaming) = result
          
        except Exception, e:
            writer.writerow(e)
            continue

        try:
            with open(f1, 'a') as f_orig, \
                    open(f2, 'a') as f_no_renaming, \
                    open(f3, 'a') as f_basic_renaming, \
                    open(f4, 'a') as f_hash_renaming, \
                    open(f5, 'a') as f_hash_def_one_renaming, \
                    open(f6, 'a') as f_hash_def_two_renaming:
                f_orig.writelines(orig)
                f_no_renaming.writelines(no_renaming)
                f_basic_renaming.writelines(basic_renaming)
                f_hash_renaming.writelines(hash_renaming)
                f_hash_def_one_renaming.writelines(hash_def_one_renaming)
                f_hash_def_two_renaming.writelines(hash_def_two_renaming)
                
            writer.writerow([js_file_path, 'OK'])
    
        except Exception, e:
            writer.writerow([js_file_path, str(e)])
            exit()

