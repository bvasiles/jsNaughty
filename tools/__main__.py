import os
import re
import sourcemap
# from experimentUtils import TimeExceededError, timeout, timestamp, replaceSciNotNum
import multiprocessing

# from pygmentsUtils import tokensExceptTokenType, tokensReplaceTokenOfType, \
#                         fixIncompleteDecimals, writeTmpLines, formatTokens
from pygments.lexers import get_lexer_for_filename
from pygments import lex
from pygments.token import *
# from jsUtils import scoper
from scoper import ScopeAnalyst
from indexer import IndexBuilder
# import json


import signal
#SIGALRM is only usable on a unix platform
# signal.signal(signal.SIGALRM, timeout)


def processFile(js_file_path):
    
    js_file_path = os.path.abspath(js_file_path)
    print js_file_path
    
    pid = multiprocessing.current_process().ident
    
    # Compute scoping: name2scope is a dictionary where keys
    # are (name, start_index) tuples and values are scope identifiers. 
    # Note: start_index is a flat (unidimensional) index, 
    # not a (line_chr_idx, col_chr_idx) index.
    scopeAnalyst = ScopeAnalyst(js_file_path)
    name2scope = scopeAnalyst.resolve_scope()
    
    # Load in the minified file
    minified = open(js_file_path).read()
    
    # Create lexer
    lexer = get_lexer_for_filename(js_file_path)
    
    # Tokenize input and compute mappings between the different 
    # indices used: (line, col), flat, (l,c) in token list
    indexBuilder = IndexBuilder(lex(minified, lexer))
    tokens = indexBuilder.tokens
    
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
#             t.append(tokens[tl][tc][1])
            t.append(orig)

#         if token == 'n':
        print '\nNAME:', token#, pos, tt
#             #(scope,pth,d_start.get('$ref',None))
#         print 'scope:', scope
            
#         print sorted(set([tli for (tli,tci) in tt]))
        for tl in sorted(set([tli for (tli,tci) in tt])):
#             print tl, [tci for (tli,tci) in tt if tli==tl]
            l = list(tokens[tl])
#             print ' '.join([x[1] for x in l])
            for tc in [tci for (tli,tci) in tt if tli==tl]:
                l[tc] = (l[tc][0], unichr(0x2588))
#             if token == 'n':
            print '  ', '%d:'%tl, ' '.join([x[1] for x in l])

    print
    print

    return

# manager = multiprocessing.Manager()
# ns = manager.Namespace()

js_file_paths = ['test_file.js']


pool = multiprocessing.Pool(processes=4)
# pool.imap(processFile, js_file_paths)
for res in pool.imap(processFile, js_file_paths):
    pass

    