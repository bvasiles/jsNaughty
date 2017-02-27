import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from pygments import lex
from pygments.token import Token
from pygments.token import is_token_subtype 
from pygments.lexers import get_lexer_for_filename
from collections import Counter
from tools import Lexer
from folderManager import Folder
from scipy import stats
import numpy
def median(lst):
    return numpy.median(numpy.array(lst))

def read_in_chunks(file_object, chunk_size=1024):
    """Lazy function (generator) to read a file piece by piece.
    Default chunk size: 1k."""
    while True:
        data = file_object.read(chunk_size)
        if not data:
            break
        yield data

lexer = get_lexer_for_filename("jsFile.js")

f = open('really_big_file.dat')

corpora = Folder(sys.argv[1]).fullFileNames("*.js")

for path_corpus in [c for c in corpora if 'orig' in c or 'no_renaming' in c or 'hash_def_one_renaming' in c]:
    print os.path.basename(path_corpus)
    f = open(path_corpus)

    names = set([])
    
    for piece in read_in_chunks(f):
        #process_data(piece)
        
        tokens = lex(piece, lexer).tokenList
        
        names.update([token for (token_type, token) in tokens
                 if is_token_subtype(token_type, Token.Name)])
    
    cnt = Counter(names) 
    print ' ', len(cnt.keys()), 'names'
    s = stats.describe(cnt.values())
    print '  min =', s[1][0]
    print '  max =', s[1][1]
    print '  mean =', s[2]
    print '  variance =', s[3]
    print '  median =', median(cnt.values())

    print
