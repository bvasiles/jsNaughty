import os
import sourcemap
import multiprocessing

from pygments.lexers import get_lexer_for_filename
from pygments import lex
from tools import Acorn, IndexBuilder, JSNice, UnuglifyJS, ScopeAnalyst


# import signal
#SIGALRM is only usable on a unix platform
# signal.signal(signal.SIGALRM, timeout)


def processFile(js_file_path):
    
    js_file_path = os.path.abspath(js_file_path)
    
    print 'READING:', js_file_path
    
    acorn = Acorn()
    (_stdout, acorn_ok) = acorn.run(js_file_path)
    print 'RUNNING Acorn:', acorn_ok
    
    # Load in the minified file
    minified = open(js_file_path).read()
    
    # Create lexer
    lexer = get_lexer_for_filename(js_file_path)
    
    # Tokenize input and compute mappings between the different 
    # indices used: (line, col), flat, (l,c) in token list
    indexBuilder = IndexBuilder(lex(minified, lexer))
    tokens = indexBuilder.tokens
    print 'RUNNING IndexBuilder:', len(tokens)>0
    
    nice1 = JSNice()
    (ok, _out, _err) = nice1.run(js_file_path)
    print 'RUNNING JSNice:', ok
    
    nice2 = UnuglifyJS()
    (ok, _out, _err) = nice2.run(js_file_path)
    print 'RUNNING UnuglifyJS:', ok
    
    _pid = multiprocessing.current_process().ident
    
    # Compute scoping: name2scope is a dictionary where keys
    # are (name, start_index) tuples and values are scope identifiers. 
    # Note: start_index is a flat (unidimensional) index, 
    # not a (line_chr_idx, col_chr_idx) index.
    scopeAnalyst = ScopeAnalyst(js_file_path)
    name2scope = scopeAnalyst.resolve_scope()
    
    print 'RUNNING ScopeAnalyst:', len(name2scope)>0
    
    # Discover the path to the source map
    map_path = sourcemap.discover(minified)
    # Read and parse our sourcemap
    sourcemapIndex = sourcemap.load(open(map_path))
    
    # Cluster names by scope 
    nameScope2Positions = {}
    
    # Index data by (name,scope)
    for token, l in indexBuilder.name2CharPositions.iteritems():
        for (line,col) in sorted(l, key=lambda (a,b):(a,b)):
            if name2scope.has_key((token, indexBuilder.flatMap[(line,col)])):
                scope = name2scope[(token, indexBuilder.flatMap[(line,col)])]
                nameScope2Positions.setdefault((token,scope), [])
                nameScope2Positions[(token,scope)].append((line,col))

    
    for (token,scope), positions in sorted(nameScope2Positions.iteritems(), \
                                           key=lambda (x,y):x[0]):
        pos = sorted(positions, key = lambda e:(e[0],e[1]))
        t = []
        tt = []
        line_tok_idxs = set([])
        for (l,c) in pos:
            orig = sourcemapIndex.lookup(line=l, column=c).name
            (tl,tc) = indexBuilder.revTokMap[(l,c)]
            line_tok_idxs.add(tl)
            tt.append((tl,tc))
            t.append(orig)

        if token == 'n':
            print '\nNAME:', token
    
            for tl in sorted(set([tli for (tli,tci) in tt])):
                l = list(tokens[tl])
                for tc in [tci for (tli,tci) in tt if tli==tl]:
                    l[tc] = (l[tc][0], unichr(0x2588))
                print '  ', '%d:'%tl, ' '.join([x[1] for x in l])

    return

# manager = multiprocessing.Manager()
# ns = manager.Namespace()

js_file_paths = ['test_file.js']


pool = multiprocessing.Pool(processes=4)
# pool.imap(processFile, js_file_paths)
for res in pool.imap(processFile, js_file_paths):
    pass

    