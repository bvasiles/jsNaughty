import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader 
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst

from pygments.token import Token, is_token_subtype
import hashlib


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


def generateScopeIds(num_scopes, except_ids):
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
            name2defScope = scopeAnalyst.resolve_scope()
            isGlobal = scopeAnalyst.isGlobal
            name2useScope = scopeAnalyst.resolve_use_scope()
        except:
            cleanup(pid)
            return (None, 'ScopeAnalyst fail')
        
        # Figure out which _scope_idx suffixes are illegal
        except_ids = map(int, [name.split('_')[-1] 
                        for name in scopeAnalyst.nameScopes.keys()
                        if name.split('_')[-1].isdigit()])
        
        # Compute shorter def_scope identifiers
        scopes = set(name2defScope.values())
        scope2id = dict(zip(scopes, generateScopeIds(len(scopes), except_ids)))

        orig = []
        no_renaming = []
        basic_renaming = []
        
        # Simple renaming: disambiguate overloaded names 
        # with indices: n -> n_1, n_2, n_3.
        # The index is the def_scope id.
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            
            orig.append(' '.join([t for (_tt,t) in iBuilder_clear.tokens[line_idx]]) + "\n")
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
            
            new_line = []
            for token_idx, (token_type, token) in enumerate(line):
                try:
                    (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
                    pos = iBuilder_ugly.flatMap[(l,c)]
                    def_scope = name2defScope[(token, pos)]
                except KeyError:
                    new_line.append(token)
                    continue

                if is_token_subtype(token_type, Token.Name) and \
                        scopeAnalyst.is_overloaded(token) and \
                        not isGlobal[(token, pos)]:
                    # Must rename token to something else
                    # Append def_scope id to name
                    new_line.append('%s_%d' % (token, scope2id[def_scope]))
                else:
                    new_line.append(token)
            
            basic_renaming.append(' '.join(new_line) + "\n")
        
        
        # More complicated renaming: collect the context around  
        # each name (global variables, API calls, punctuation)
        # and build a hash of the concatenation.
        
        hash_renaming = []
        
        
        def isValidContextToken((token_type, token)):
            # Token.Name.* if not u'TOKEN_LITERAL_NUMBER' or u'TOKEN_LITERAL_STRING'
            # Token.Operator
            # Token.Punctuation
            # Token.Keyword.*
            if token != u'TOKEN_LITERAL_NUMBER' and \
                    token != u'TOKEN_LITERAL_STRING':
#                  and \
#                     (is_token_subtype(token_type, Token.Name) or \
#                     is_token_subtype(token_type, Token.Punctuation) or \
#                     is_token_subtype(token_type, Token.Operator)):
                return True
            return False
        
        
        def sha(concat_str, debug=False):
            if not debug:
                return '_' + hashlib.sha1(concat_str).hexdigest()[:8]
            else:
                return '<<' + concat_str + '>>'
        
                
        context = {}
        
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            
            # Which minified names are on this line?
            mini_names = []
            line_context = []
            
            for token_idx, (token_type, token) in enumerate(line):
                try:
                    (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
                    pos = iBuilder_ugly.flatMap[(l,c)]
                    # flatMap only exists for tokens of type Token.Name
                    
                    if not isGlobal[(token, pos)]:
                        mini_names.append((token, pos))
                        
                        def_scope = name2defScope[(token, pos)]
                        
                        where_before = [tix \
                                        for tix, (tt, t) in enumerate(line) \
                                        if t == token and \
                                        tt == token_type and \
                                        tix < token_idx and \
                                        name2defScope[(t, iBuilder_ugly.flatMap[iBuilder_ugly.tokMap[(line_idx,tix)]])] == def_scope]

                        left = max(where_before) if len(where_before) else 0
                        context_tokens = [t \
                                        for (t, p) in line_context \
                                        if p >= left and \
                                        p < pos]
                            
                        context.setdefault((token, def_scope), [])
                        context[(token, def_scope)] += context_tokens
                            
                    else:
                        if isValidContextToken((token_type, token)):
#                             line_context.append(token)
                            line_context.append((token, pos))

                except KeyError:
                    if isValidContextToken((token_type, token)):
#                         line_context.append(token)
                        line_context.append((token, pos))
                        
        shas = {}
        reverse_shas = {}
        
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            
            new_line = []
            for token_idx, (token_type, token) in enumerate(line):
                try:
                    (l,c) = iBuilder_ugly.tokMap[(line_idx, token_idx)]
                    
                    # flatMap only exists for tokens of type Token.Name
                    pos = iBuilder_ugly.flatMap[(l,c)]
                    def_scope = name2defScope[(token, pos)]
                    use_scope = name2useScope[(token, pos)]
                    
                    # context only exists for non-global names
                    concat_str = ''.join(context[(token, def_scope)])
                    
                    # Compute SHA1 hash of the context tokens
                    sha_str = sha(concat_str, debug=False)
                    
                    # Replace name by SHA1 hash
                    new_token = shas.setdefault(concat_str, sha_str)
                    
                    # Compute reverse mapping
                    reverse_shas.setdefault((sha_str, use_scope), set([]))
                    reverse_shas[(sha_str, use_scope)].add(token)
                    
                    # Detect collisions
                    if len(reverse_shas[(sha_str, use_scope)]) > 1:
#                         print (sha_str, use_scope)
#                         print reverse_shas[(sha_str, use_scope)]
#                         print 
                        # Two different names from the same use_scope
                        # have the same hash. Rename one by prepending
                        # the variable/function name to the hash
                        sha_str = token + sha_str
                        new_token = sha_str
                    
                    new_line.append(new_token)
                    
                except KeyError:
                    # Everything except non-global names stays the same
                    new_line.append(token)
           
            hash_renaming.append(' '.join(new_line) + "\n")

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



