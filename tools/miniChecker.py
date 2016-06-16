import os
import sourcemap
from pygments import lex
from pygments.lexers import get_lexer_for_filename
from pygments.token import Token
from pygments.token import is_token_subtype
from uglifyJS import Uglifier


class MiniChecker:
    '''
    Check if JS file is minified by comparing the 
    length of variable names before and after another 
    (artificial) minification.
    '''
    def __init__(self, js_path):
        self.js_path = js_path
        
    def compare(self, mini_js_path=None, keep_mini=True):
        lexer = get_lexer_for_filename(self.js_path)
        
        # before
        tmp_b = open(self.js_path, 'r').read()
        tokens_b = list(lex(tmp_b, lexer))
        
        # Discover the path to the source map
        map_path = sourcemap.discover(tmp_b)
        if map_path is not None:
            # The file couldn't have a source map unless it is already minified
            return True
    
        # after
        if mini_js_path is None:
            uglifier = Uglifier()
            mini_js_path = os.path.abspath('tmp.u.js')
            uglifyjs_ok = uglifier.run(self.js_path, mini_js_path)
            if not uglifyjs_ok:
                raise Exception, 'Uglifier failed'
        
        uglified = open(mini_js_path, 'r').read()
        tokens_u = list(lex(uglified, lexer)) # returns a generator of tuples

        if not len(tokens_b) == len(tokens_u):
            if not keep_mini:
                os.remove(mini_js_path)
            raise Exception, 'Different number of tokens'

        clean_names = [token for (token_type, token) in tokens_b 
                      if is_token_subtype(token_type, Token.Name)]
        
        ugly_names = [token for (token_type, token) in tokens_u 
                      if is_token_subtype(token_type, Token.Name)]
        
        same = [idx for (idx,token) in enumerate(clean_names) 
                if ugly_names[idx]==token]
        
        clean_names_n = [token for (idx,token) in enumerate(clean_names)
                        if idx not in same]
        ugly_names_n = [token for (idx,token) in enumerate(ugly_names)
                        if idx not in same]
        if sum([len(v) for v in clean_names_n]) <= \
                sum([len(v) for v in ugly_names_n]):
            if not keep_mini:
                os.remove(mini_js_path)
            return True
        
        if not keep_mini:
            os.remove(mini_js_path)
        return False


if __name__ == "__main__":
    
    def check(f, keep_mini):
        mc = MiniChecker(f)
        try:
            print 'is_minified(%s):' % f, mc.compare(keep_mini=keep_mini)
        except Exception as e:
            print e

    check('../test_file1.js', False)
    check('../node_scoper/test_input.js', False)
    check('../test_file2.js', False)

