import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from pygments.token import Token, is_token_subtype
from collections import Counter
from tools import Lexer
from folderManager import Folder
from scipy import stats
import numpy
def median(lst):
    return numpy.median(numpy.array(lst))


corpora = Folder(sys.argv[1]).fullFileNames("*.js")

for path_corpus in corpora:
    print os.path.basename(path_corpus)
    tokens = Lexer(path_corpus).tokenList
        
    names = [token for (token_type, token) in tokens 
             if is_token_subtype(token_type, Token.Name)]
    
    cnt = Counter(names) 
    print ' ', len(cnt.keys()), 'names'
    s = stats.describe(cnt.values())
    print '  min =', s[1][0]
    print '  max =', s[1][1]
    print '  mean =', s[2]
    print '  variance =', s[3]
    print '  median =', median(cnt.values())

    print
