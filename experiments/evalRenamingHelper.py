import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import ScopeAnalyst, Lexer, IndexBuilder
                    
def processFile(l):
    
    js_file_name = l
    
    candidates = []
    
    if(True):    
    #try:
        print(js_file_name)
        lexer = Lexer(js_file_name)
        return IndexBuilder(lexer.tokenList)        
    #except:
    #    print('Process fail')
    #    return []

def processObsFile(l):
    '''
    get the token list for an obsfuscated file.
    '''
    point = l.rfind(".")
    return processFile(l[:point] + ".u" + l[point:])

def getVarAt(var_tuple, ib):
    '''
    Given a tuple (file_name, rename_strat, consistency_strat, line_id, token_id_in_line) and a indexBuilder for a file
    return the original token name
    '''
    line_char_index = ib.tokMap[(var_tuple[3], var_tuple[4])]
    return ib.charPosition2Name[line_char_index]

def suggestionExactMatch(suggestion_list, word):
    '''Is word in the comma separated suggestion list'''
    words = suggestion_list.split(',')
    print(suggestion_list + " --- " + word + " --- " + str(word in words))
    return word in words

def charsInOrder(w1,w2):
    '''
    Returns true if w2 contains the letters of w1 in order
    '''

    pointer = 0
    for c in w1:
        if(pointer >= len(w2)): #terminate
            return False
        while(w2[pointer] != c):
            pointer += 1
            if(pointer >= len(w2)): #terminate
                return False
        
        pointer += 1

    return True

def isAbbrev(w1, w2):
    '''
    Returns true if one word is an abbreviation of the other, i.e.
    does w1 contain the letters of w2 in order, or vice versa.
    We ignore single character identifiers and identifiers that
    don't start with the same token as not being abbreviations
    '''
    if(len(w1) <= 1 or len(w2) <= 1):
        return False
    elif(w1[0] != w2[0]):
        return False
    return charsInOrder(w1,w2) or charsInOrder(w2,w1)
        

def suggestionApproximateMatch(suggestion_list, word):
    '''
    Try to find approximate string matches for the word in the suggestion list
    return a tuple matching a list of approximate matching strategies in the 
    following order:
    1) case-insensitivity
    2) 1) + remove underscores and $
    3) 1) + 2) + exact containment (a suggestion contains the word/ word contains the suggestion   
    4) abbreviations - after 1) + 2) -> does either a word in the suggestion list/orig word contain the characters of the other
    '''
    word_lower = word.lower()
    word_nspec = word_lower.replace("$","").replace("_","")

    sg_lower = [n.lower() for n in suggestion_list]
    sg_nspec = [n.replace("$","").replace("_","") for n in sg_lower]

    case_insen = any([word_lower == n  for n in sg_lower])
    nonSpec = any([word_nspec == n for n in sg_nspec])
    contains = any([(len(word_nspec) >= 3 and len(n) >= 3) and (word_nspec in n or n in word_nspec) for n in sg_nspec])
    abbrev = any([isAbbrev(n, word_nspec) for n in sg_nspec])
    return (case_insen, nonSpec, contains, abbrev)
