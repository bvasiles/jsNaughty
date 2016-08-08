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
    name2defScope = scopeAnalyst.resolve_scope()
    isGlobal = scopeAnalyst.isGlobal
    
    print 'RUNNING ScopeAnalyst:', len(name2defScope)>0

    name2useScope = scopeAnalyst.name2useScope
    name2pth = scopeAnalyst.name2pth
    nameOrigin = scopeAnalyst.nameOrigin
    
    scopes = set(name2useScope.values())

    for scope in scopes:
        print scope
        lc_list = [indexBuilder.revTokMap[indexBuilder.revFlatMat[pos]] 
                   for (t,pos) in name2useScope.keys()  
                   if name2useScope[(t,pos)] == scope]
        highlight(tokens, lc_list) 
        print
   
    # Discover the path to the source map
    _map_path = sourcemap.discover(minified)
    # Read and parse our sourcemap
#     sourcemapIndex = sourcemap.load(open(map_path))
    
    # Cluster names by scope 
    nameScope2Positions = {}
    
    # Index data by (name,scope)
    for token, l in indexBuilder.name2CharPositions.iteritems():
        for (line,col) in sorted(l, key=lambda (a,b):(a,b)):
            pos = indexBuilder.flatMap[(line,col)]
            if name2defScope.has_key((token, pos)):
                scope = name2defScope[(token, pos)]
                use_scope = name2useScope[(token, pos)]
                pth = name2pth[(token, pos)]
                
                glb = isGlobal[(token, pos)]
                
                nameScope2Positions.setdefault((token,scope,glb), [])
                nameScope2Positions[(token,scope,glb)].append((line,col))
                
#                 print token, pos
#                 print 'def:', scope
#                 print 'use:', use_scope
#                 print 'pth:', pth
#                 highlight(tokens, [indexBuilder.revTokMap[indexBuilder.revFlatMat[pos]]])
#                 print
                
    
    for (token,scope,glb), positions in sorted(nameScope2Positions.iteritems(), \
                                           key=lambda (x,y):x[0]):

        if glb:
            continue
        
        pos = sorted(positions, key = lambda e:(e[0],e[1]))
#         t = []
        tt = []
        line_tok_idxs = set([])
        for (l,c) in pos:
#             orig = sourcemapIndex.lookup(line=l, column=c).name
            (tl,tc) = indexBuilder.revTokMap[(l,c)]
            line_tok_idxs.add(tl)
            p = indexBuilder.flatMap[(l,c)]
            tt.append(((tl,tc),p))
#             t.append(orig)

#         if token == 'n':
        print '\nNAME:', token.encode('utf-8'), 'isGlobal =', glb
#         print scope
#         highlight(tokens, [indexBuilder.revTokMap[indexBuilder.revFlatMat[pos]]])
        
        for ((tli,tci),p) in tt:
            scope = name2defScope[(token, p)]
            use_scope = name2useScope[(token, p)]
            pth = name2pth[(token, p)]
            origin = nameOrigin[(token, scope)]
#             print token #, p, origin
#             print
#             print 'def:', scope
#             print 'use:', use_scope
#             print 'pth:', pth
#             print
  
        for tl in sorted(set([tli for ((tli,tci),p) in tt])):
            l = list(tokens[tl])
            for tc in [tci for ((tli,tci),p) in tt if tli==tl]:
                l[tc] = (l[tc][0], unichr(0x2588) + token + unichr(0x2588))
                
#                 pos = indexBuilder.flatMap[(line,col)]
            
            print '  ', '%d:' % (tl+1), ' '.join([x[1].encode('utf-8') for x in l])
            
        print

    return


def highlight(tokens, lc_list):
    h = dict.fromkeys(lc_list, True)
    
    for line_idx, line in enumerate(tokens):
        new_line = []
        for tok_idx, (_tt,t) in enumerate(line):
            if h.has_key((line_idx, tok_idx)):
                new_line.append(unichr(0x2588) + t + unichr(0x2588))
            else:
                new_line.append(t)
            
        print '  ', ' '.join([t.encode('utf-8') for t in new_line])


# manager = multiprocessing.Manager()
# ns = manager.Namespace()

js_file_paths = ['test_file3.js']


pool = multiprocessing.Pool(processes=4)
# pool.imap(processFile, js_file_paths)
for res in pool.imap(processFile, js_file_paths):
    pass

    
