from pygments import lex
from pygments.token import Token, STANDARD_TYPES, Comment, Number, String
from pygments.token import is_token_subtype 
from pygments.lexers import get_lexer_for_filename
from unidecode import unidecode


import re
# scinot = re.compile('[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)')
# scinot = re.compile('[\s=]+([+-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+))')
scinot = re.compile(r'\b([+-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+))')
# Updated as per http://stackoverflow.com/questions/41668588
def replaceSciNotNum(text):
    """
    The JS parser from UglifyJS fails on scientific notation
    Use this to replace all scinot numbers
    """
    return scinot.sub(lambda x: str(float(x.group(1))), text)
#     return re.sub('[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)', lambda x: str(float(x.group())), text)


def handleUnicodeEscape(tokens, tokenType, technique="REMOVE"):
    '''
    The subprocess module is struggling with unicode escape characters inside string literals.
    This method removes or replaces all unicode escape characters inside tokens of tokenType.
    technique: "REMOVE" or "REPLACE", defaults to "REMOVE" if another string is sent.
    '''
    rt = []
    if(technique == "REPLACE"): #Not implemented yet.
        for t in tokens:
            newTok = t
            if(is_token_subtype(t[0], tokenType)):
                #DO Stuff
                newTok = (t[0], re.sub(r'[^\x00-\x7F]+',' ', t[1].decode("unicode_escape")))
                
            rt.append(newTok)
    else:
        for t in tokens:
            newTok = t
            if(is_token_subtype(t[0], tokenType)):
#                 print(t)
#                 newTok = (t[0], re.sub(r'[^\x00-\x7F]+','', t[1].decode("unicode_escape")))
                newTok = (t[0], unidecode(t[1]))
                
            rt.append(newTok)
    return rt
        

def tokensExceptTokenType(tokens, 
                          tokenType, 
                          ignoreSubtypes = False):
    """
    @author: Naji Dmeiri
    :param tokens:          A list of `Token` objects as defined in `pygments.token`
    :param tokenType:       A `TokenType` object as defined in `pygments.token`
    :param ignoreSubtypes:  When set to True, the returned list will include subtypes of `tokenType` ; default is `False`.
    :returns:               An iterable of tuples that each hold information about a `tokenType` tokens.
    """
    if tokenType not in STANDARD_TYPES:
        raise ValueError("%s is not a standard Pygments token type." % tokenType)

    rt = []
    for t in tokens:
        rm = False
        if not ignoreSubtypes:
            if is_token_subtype(t[0], tokenType):
                rm = True
        else:
            if t[0] == tokenType:
                rm = True
        if not rm:
            rt.append(t)
        else:
            if t[0] == Comment.Single:
                if t[1].endswith('\n'):
                    rt.append((Token.Text, u'\n'))
    return rt


def tokensReplaceTokenOfType(tokens, 
                             tokenType, 
                             replacementValue, 
                             ignoreSubtypes = False):
    """
    :param tokens:          A list of `Token` objects as defined in `pygments.token`
    :param tokenType:       A `TokenType` object as defined in `pygments.token`
    :param replacementValue:
    :param ignoreSubtypes:  When set to True, the returned list will include subtypes of `tokenType` ; default is `False`.
    :returns:               An iterable of tuples that each hold information about a `tokenType` tokens.
    """
    if tokenType not in STANDARD_TYPES:
        raise ValueError("%s is not a standard Pygments token type." % tokenType)

    if not ignoreSubtypes:
        return [t if not is_token_subtype(t[0], tokenType) 
                else (t[0], replacementValue) for t in tokens]
    else:
        return [t if not t[0] == tokenType 
                else (t[0], replacementValue) for t in tokens]



from kmp import KnuthMorrisPratt
from copy import deepcopy
def fixIncompleteDecimals(tokenList):
    """
    Replaces .NUMBER by 0.NUMBER (otherwise the JS parser fails)
    """
    filteredTokenList = deepcopy(tokenList)
     
    pattern = [Token.Punctuation, Number.Integer]
    shift = 0
    for s in KnuthMorrisPratt([t[0] for t in tokenList], pattern):
        match = tokenList[s:s+len(pattern)]
        if match[pattern.index(Token.Punctuation)][1] == '.':
            if s>0 and s<len(tokenList)-1:
                if tokenList[s-1][0] != Token.Text and \
                        tokenList[s-1][0] != Token.Operator and \
                        tokenList[s-1][0] != Token.Keyword and \
                        tokenList[s-1][0] != Token.Punctuation:
                    continue
                del filteredTokenList[s-shift]
                filteredTokenList[s-shift] = (Number.Float, 
                                        '0.%s' % filteredTokenList[s-shift][1])
                shift += 1
    
    return filteredTokenList



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


def formatLines(lines):
    return '\n'.join([' '.join([token for (_token_type, token) in line]) 
                      for line in lines])


def writeTmpLines(lines, out_file_path):
    js_tmp = open(out_file_path, 'w')
    js_tmp.write(formatLines(lines).encode('utf8'))
    js_tmp.write('\n')
    js_tmp.close()
    
    

class LMPreprocessor:
    
    def __basics(self, js_text):
        # lex
#         lexer = get_lexer_for_filename(js_file_path)
        self.lexer = get_lexer_for_filename("jsFile.js")
        
        # FIXME: right now I'm replacing all numbers in 
        # scientific notation by 1. Replace by actual value
        programText = replaceSciNotNum(js_text)
#         print '======='
#         print(programText)
#         print '======='

        # Tokenize input
        self.tokenList = list(lex(programText, self.lexer))

        # Remove comments
        self.tokenList = tokensExceptTokenType(self.tokenList, Token.Comment)
    
        # Replace .1 by 0.1
        self.tokenList = fixIncompleteDecimals(self.tokenList)
        
        # Strip annotations and literals
        self.tokenList = tokensExceptTokenType(self.tokenList, String.Doc)
#         print(self.tokenList)
        
        #Remove unicode escape characters
        self.tokenList = handleUnicodeEscape(self.tokenList, Token.Literal)
#         print(self.tokenList)


    def __preprocess(self, js_text):
        self.__basics(js_text)
        

    def __init__(self, js_file_path):
        self.__preprocess(open(js_file_path, 'r').read())
    

    def write_temp_file(self, out_file_path):
        lines = formatTokens(self.tokenList)
        writeTmpLines(lines, out_file_path)
        
    def __str__(self):
        lines = formatTokens(self.tokenList)
        return formatLines(lines).encode('utf8')
    
    
class Preprocessor(LMPreprocessor):
    
    def __preprocess(self, js_text):
        self.__basics(js_text)

        self.tokenList = tokensReplaceTokenOfType(self.tokenList, String, 
                                          'TOKEN_LITERAL_STRING')
        self.tokenList = tokensReplaceTokenOfType(self.tokenList, Number, 
                                          'TOKEN_LITERAL_NUMBER')
                

class WebPreprocessor(Preprocessor):
    
    def __init__(self, js_text):
        self._Preprocessor__preprocess(js_text)
    

class WebLMPreprocessor(LMPreprocessor):
    
    def __init__(self, js_text):
        self._LMPreprocessor__preprocess(js_text)
        
