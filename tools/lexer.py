from pygments import lex
from pygments.token import Token
from pygments.token import is_token_subtype 
from pygments.lexers import get_lexer_for_filename


def formatTokens(tokenList):
    lines = []
    line = []
    for (token_type, token) in tokenList:
        if not is_token_subtype(token_type, Token.Text):
            line.append((token_type, token.strip()))
        elif '\n' in token:
            lines.append(line)
            line = []
    return lines


def writeTmpLines(lines, out_file_path):
    js_tmp = open(out_file_path, 'w')
    js_tmp.write('\n'.join([' '.join([token for (_token_type, token) in line]) 
                            for line in lines]).encode('utf8'))
    js_tmp.write('\n')
    js_tmp.close()
    
    

class Lexer:

    def __init__(self, js_file_path):
        self.programText = open(js_file_path, 'r').read()
        lexer = get_lexer_for_filename(js_file_path)
    
        # Tokenize input
        self.tokenList = list(lex(self.programText, lexer))


    def write_temp_file(self, out_file_path):
        lines = formatTokens(self.tokenList)
        writeTmpLines(lines, out_file_path)
        
class WebLexer:
    '''
    Variant that takes raw Text instead of input file
    '''
    
    def __init__(self, inputText):
        programText = inputText
        lexer = get_lexer_for_filename("jsFile.js")
    
        # Tokenize input
        self.tokenList = list(lex(programText, lexer))
        
    def write_temp_file(self, out_file_path):
        lines = formatTokens(self.tokenList)
        writeTmpLines(lines, out_file_path)
    




