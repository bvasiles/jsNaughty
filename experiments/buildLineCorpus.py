import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from folderManager import Folder
from unicodeManager import UnicodeWriter, UnicodeReader 
from tools import Uglifier, MiniChecker, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst

from pygments.token import Token, is_token_subtype


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


def scopeIds(num_scopes, except_ids):
    ids = []
    idx = 0
    while len(ids) < num_scopes:
        if idx not in except_ids:
            ids.append(idx)
        idx += 1
    return ids


def processFile(l):
    
    [js_file_path] = l
    
    pid = int(multiprocessing.current_process().ident)
    
    try:
        signal.alarm(600)
        
        path_tmp = 'tmp_%d.js' % pid
        path_tmp_b = 'tmp_%d.b.js' % pid
        path_tmp_u = 'tmp_%d.u.js' % pid
        path_tmp_b_a = 'tmp_%d.b.a.js' % pid
        path_tmp_u_a = 'tmp_%d.u.a.js' % pid
        
        # Strip comments, replace literals, etc
        prepro = Preprocessor(os.path.join(corpus_root, js_file_path))
        prepro.write_temp_file(path_tmp)
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        ok = clear.run(path_tmp, path_tmp_b)
         
        if not ok:
            cleanup(pid)
            return None
        
        # Minify
        ugly = Uglifier()
        ok = ugly.run(path_tmp_b, path_tmp_u)
        
        if not ok:
            cleanup(pid)
            return None
        
        # Num tokens before vs after 
        tok_clear = Lexer(path_tmp_b).tokenList
        tok_ugly = Lexer(path_tmp_u).tokenList
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(pid)
            return None
        
        # Align minified and clear files, in case the beautifier 
        # did something weird 
        aligner = Aligner()
        aligner.align(path_tmp_b, path_tmp_u)
        
        ### This is the baseline corpus, no (smart) renaming yet ###
        
        iBuilder_clear = IndexBuilder(Lexer(path_tmp_b_a).tokenList)
        iBuilder_ugly = IndexBuilder(Lexer(path_tmp_u_a).tokenList)
        
        # Compute scoping: name2scope is a dictionary where keys
        # are (name, start_index) tuples and values are scope identifiers. 
        # Note: start_index is a flat (unidimensional) index, 
        # not a (line_chr_idx, col_chr_idx) index.
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(os.path.dirname(os.path.realpath(__file__)), path_tmp_u_a))
            name2scope = scopeAnalyst.resolve_scope()
        except Exception as e:
#             print 'I encountered an error, probably the JSON was too large'
#             print e
            cleanup(pid)
            return None
        
        # Figure out which _scope_idx suffixes are illegal
        except_ids = map(int, [name.split('_')[-1] 
                        for name in scopeAnalyst.nameScopes.keys()
                        if name.split('_')[-1].isdigit()])
        
        # Compute shorter scope identifiers
        scopes = set(name2scope.values())
        scope2id = dict(zip(scopes, scopeIds(len(scopes), except_ids)))

        # Simple renaming: disambiguate overloaded names with indices
        # n -> n1, n2, n3
        
        orig = []
        no_renaming = []
        basic_renaming = []
        
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            
            orig.append(' '.join([t for (_tt,t) in iBuilder_clear.tokens[line_idx]]) + "\n")
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
            
            new_line = []
            for token_idx, (token_type, token) in enumerate(line):
                try:
                    (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
                    pos = iBuilder_ugly.flatMap[(l,c)]
                    scope = name2scope[(token, pos)]
                except KeyError:
                    new_line.append(token)
                    continue

                if is_token_subtype(token_type, Token.Name) and \
                        scopeAnalyst.is_overloaded(token):
                    # Must rename token to something else
                    # Append scope id to name
                    new_line.append('%s_%d' % (token, scope2id[scope]))
                else:
                    new_line.append(token)
            
            basic_renaming.append(' '.join(new_line) + "\n")
        
        cleanup(pid)
        return (orig, no_renaming, basic_renaming)
        
         
    except TimeExceededError:
        cleanup(pid)
        pass

#         return [os.path.basename(js_file_path), 'Timeout']
        

    
    
corpus_root = os.path.abspath(sys.argv[1])
training_sample_path = sys.argv[2]

training_sample = {}
with open(training_sample_path, 'rb') as f:
    reader = UnicodeReader(f)
#     for row in reader:
#         training_sample[row[0]] = True

    pool = multiprocessing.Pool(processes=8)
    # with open('isMinified.csv', 'wb') as f:
    #     writer = UnicodeWriter(f)
    for result in pool.imap(processFile, reader):
#         pass
        if result is not None:
            (orig, no_renaming, basic_renaming) = result
          
            with open('corpus.orig.js', 'wb') as f_orig, \
                    open('corpus.no_renaming.js', 'wb') as f_no_renaming, \
                    open('corpus.basic_renaming.js', 'wb') as f_basic_renaming:
                f_orig.writelines(orig)
                f_no_renaming.writelines(no_renaming)
                f_basic_renaming.writelines(basic_renaming)

# print training_sample.keys()[:3]

    
#     writer.writerow(line)

