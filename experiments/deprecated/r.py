import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import ScopeAnalyst, Lexer, IndexBuilder
                    

def processFile(js_file_name):
    
    candidates = []
        
    lexer = Lexer(js_file_name)
    iBuilder = IndexBuilder(lexer.tokenList)
    
    scopeAnalyst = ScopeAnalyst(js_file_name)
    nameOrigin = scopeAnalyst.nameOrigin
    isGlobal = scopeAnalyst.isGlobal
    nameDefScope2pos = scopeAnalyst.nameDefScope2pos
    
    for (name, def_scope) in nameOrigin.iterkeys():
        pos = nameDefScope2pos[(name, def_scope)]
        
        (lin,col) = iBuilder.revFlatMat[pos]
        scope = iBuilder.revTokMap[(lin,col)]
        
        glb = isGlobal.get((name, pos), True)
        
        
        if name != 'TOKEN_LITERAL_STRING' and \
                name != 'TOKEN_LITERAL_NUMBER':
            candidates.append( (scope, name, pos, (lin,col), glb, def_scope) )
    
    print
    print
    for c in sorted(candidates, key=lambda e:e[0]):
        (scope, name, pos, (lin,col), glb, def_scope) = c
        
        if name == 'n' or name == 'calendarEventId':
            print '\t', scope, name, pos, (lin,col), glb
            print '\t\t', def_scope



files = [
#     'results/corpus.6k.orig_ini/3168534.hash_def_one_renaming.freqlen.js',
#     'results/corpus.6k.orig_ini/3168534.hash_def_one_renaming.lm.js',
#     'results/corpus.6k.orig_ini/3168534.no_renaming.freqlen.js',
#     'results/corpus.6k.orig_ini/3168534.no_renaming.lm.js',
#     'results/corpus.6k.orig_ini/3168534.no_renaming.unscoped.freqlen.js',
#     'results/corpus.6k.orig_ini/3168534.no_renaming.unscoped.lm.js',
#     'results/corpus.6k.orig_ini/3168534.jsnice.js',
#     'results/corpus.6k.orig_ini/3168534.n2p.js',
    'results/corpus.6k.orig_ini/3168534.u.js',
    'results/corpus.6k.orig_ini/3168534.js'
]

for file_name in files:
    print
    print
    print '---', file_name, '---'
    processFile(os.path.abspath(file_name))


