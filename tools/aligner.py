from pygments.token import Token
from lexer import Lexer
from collections import deque
from os.path import splitext, basename    
    
class Aligner:
    
#     def __init__(self):
#         pass

    def align(self, js_clear_path, js_ugly_path):
        '''
        Since we only do minification the alignment is trivial.
        However, the beautifier [uglifyjs -b] may hard wrap lines
        at different positions (seems to be length dependent; minified
        lines tend to be shorter because the variables and functions
        have shorter names). Here I postprocess the beautified
        files to realign the lines, if necessary.
        '''

        # Tokenize minified file
        tokens_ugly = Lexer(js_ugly_path).tokenList
        
        # Tokenize clear file
        tokens_clear = Lexer(js_clear_path).tokenList
        
        # Also remove all newlines from list of clear tokens
        clear_deq = deque([token for (token_type, token) in tokens_clear 
                 if token_type != Token.Text])
        
        # Where to save aligned files
        js_clear_aligned_path = splitext(basename(js_clear_path))[0] + '.a.js'
        js_ugly_aligned_path = splitext(basename(js_ugly_path))[0] + '.a.js'

        with open(js_clear_aligned_path, 'wb') as clear_file, \
                open(js_ugly_aligned_path, 'wb') as ugly_file:
            
            ugly_line = []
            
            for (token_type, token) in tokens_ugly:
                if '\n' in token:
                    # The ugly line remains as it is
                    str_ugly_line = ' '.join(ugly_line).strip()
                    
                    # The clear line is adjusted to the same number 
                    # of tokens as the ugly line
                    clear_line = [clear_deq.popleft() \
                                    for _i in range(len(ugly_line))]
                    str_clear_line = ' '.join(clear_line).strip()
                    
                    ugly_file.write(str_ugly_line.encode('utf8') + '\n')
                    clear_file.write(str_clear_line.encode('utf8') + '\n')
                    
                    ugly_line = []
       
                else:
                    if token_type != Token.Text:
                        ugly_line.append(token)
    
    
    def web_align(self, tokens_clear, tokens_ugly):
        '''
        Since we only do minification the alignment is trivial.
        However, the beautifier [uglifyjs -b] may hard wrap lines
        at different positions (seems to be length dependent; minified
        lines tend to be shorter because the variables and functions
        have shorter names). Here I postprocess the beautified
        files to realign the lines, if necessary.
        '''
        
        # Also remove all newlines from list of clear tokens
        clear_deq = deque([token for (token_type, token) in tokens_clear 
                 if token_type != Token.Text])
        
        # Where to save aligned files
        js_clear_aligned = []
        js_ugly_aligned = []

        ugly_line = []
        
        for (token_type, token) in tokens_ugly:
            if '\n' in token:
                # The ugly line remains as it is
                str_ugly_line = ' '.join(ugly_line).strip()
                
                # The clear line is adjusted to the same number 
                # of tokens as the ugly line
                clear_line = [clear_deq.popleft() \
                                for _i in range(len(ugly_line))]
                str_clear_line = ' '.join(clear_line).strip()
                
                js_ugly_aligned.append(str_ugly_line.encode('utf8'))
                js_clear_aligned.append(str_clear_line.encode('utf8'))
                
                ugly_line = []
   
            else:
                if token_type != Token.Text:
                    ugly_line.append(token)
        
        return ('\n'.join(js_clear_aligned), '\n'.join(js_ugly_aligned))


if __name__ == "__main__":
    from preprocessor import Preprocessor
    prepro = Preprocessor('../test_file2.js')
    prepro.write_temp_file('tmp.js')
    
    from uglifyJS import Uglifier
    ugly = Uglifier()
    ok = ugly.run('tmp.js', 'tmp.u.js')
    
    from uglifyJS import Beautifier
    beauty = Beautifier()
    ok = beauty.run('tmp.js', 'tmp.b.js')
    
    aligner = Aligner()
    aligner.align('tmp.b.js', 'tmp.u.js')

    
