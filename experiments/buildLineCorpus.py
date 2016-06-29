import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader 
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst

from renamingStrategies import renameUsingScopeId, renameUsingHashAllPrec


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
        # Timeout after 10 minutes
        signal.alarm(600)
        
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
            return (None, 'Preprocessor fail')
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        ok = clear.run(path_tmp, path_tmp_b)
         
        if not ok:
            cleanup(pid)
            return (None, 'Beautifier fail')
        
        # Minify
        ugly = Uglifier()
        ok = ugly.run(path_tmp_b, path_tmp_u)
        
        if not ok:
            cleanup(pid)
            return (None, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            tok_clear = Lexer(path_tmp_b).tokenList
            tok_ugly = Lexer(path_tmp_u).tokenList
        except:
            cleanup(pid)
            return (None, 'Lexer fail')
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(pid)
            return (None, 'Num tokens mismatch')
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            # This is already the baseline corpus, no (smart) renaming yet
            aligner.align(path_tmp_b, path_tmp_u)
        except:
            cleanup(pid)
            return (None, 'Aligner fail')
        
        try:
            iBuilder_clear = IndexBuilder(Lexer(path_tmp_b_a).tokenList)
            iBuilder_ugly = IndexBuilder(Lexer(path_tmp_u_a).tokenList)
        except:
            cleanup(pid)
            return (None, 'IndexBuilder fail')
        
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
            return (None, 'ScopeAnalyst fail')
        
        orig = []
        no_renaming = []
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            orig.append(' '.join([t for (_tt,t) in iBuilder_clear.tokens[line_idx]]) + "\n")
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
            
        # Simple renaming: disambiguate overloaded names using scope id
        basic_renaming = renameUsingScopeId(scopeAnalyst, iBuilder_ugly)
        
        # More complicated renaming: collect the context around  
        # each name (global variables, API calls, punctuation)
        # and build a hash of the concatenation.
        hash_renaming = renameUsingHashAllPrec(scopeAnalyst, iBuilder_ugly)

        cleanup(pid)
        return (orig, no_renaming, basic_renaming, hash_renaming)
        
         
    except TimeExceededError:
        cleanup(pid)
        return (None, 'Timeout')

    
    
corpus_root = os.path.abspath(sys.argv[1])
training_sample_path = sys.argv[2]

training_sample = {}
with open(training_sample_path, 'r') as f:
    reader = UnicodeReader(f)
#     for row in reader:
#         training_sample[row[0]] = True

    pool = multiprocessing.Pool(processes=8)

    for result in pool.imap(processFile, reader):
        if result[0] is not None:
            (orig, no_renaming, basic_renaming, hash_renaming) = result
          
            with open('corpus.orig.js', 'w') as f_orig, \
                    open('corpus.no_renaming.js', 'w') as f_no_renaming, \
                    open('corpus.basic_renaming.js', 'w') as f_basic_renaming, \
                    open('corpus.hash_renaming.js', 'w') as f_hash_renaming:
                f_orig.writelines(orig)
                f_no_renaming.writelines(no_renaming)
                f_basic_renaming.writelines(basic_renaming)
                f_hash_renaming.writelines(hash_renaming)



