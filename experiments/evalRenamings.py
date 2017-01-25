import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from unicodeManager import UnicodeReader, UnicodeWriter
import multiprocessing
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
    Given a tuple (file_name, line_id, token_id_in_line) and a indexBuilder for a file
    return the original token name
    '''
    line_char_index = ib.tokMap[(var_tuple[1], var_tuple[2])]
    return ib.charPosition2Name[line_char_index]

def suggestionExactMatch(suggestion_list, word):
    '''Is word in the comma separated suggestion list'''
    words = suggestion_list.split(',')
    print(suggestion_list + " --- " + word + " --- " + str(word in words))
    return word in words

def charsInOrder(w1,w2):
    '''
    Returns true if w1 is an abbreviation of the w2, i.e.
    does w2 contain the letters of w1 in order
    '''
    pointer = 0
    for c in w1:
        if(pointer >= w2.length): #terminate
            return False
        while(w2[pointer] != c):
            pointer += 1
            if(pointer >= w2.length): #terminate
                return False
        
        pointer += 1

    return True

def isAbbrev(w1, w2):
    '''
    Returns true if one word is an abbreviation of the other, i.e.
    does w1 contain the letters of w2 in order, or vice versa.
    '''
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
    contains = any([(word_nspec in n or n in word_nspec) for n in sg_nspec])
    abbrev = any([isAbbrev(n, word_nspec) for n in sg_nspec])
    return (case_insen, nonSpec, contains, abbrev)

try:
    csv_path = os.path.abspath(sys.argv[1])
    orig_dir = os.path.abspath(sys.argv[2])
except:
    print("usage: python evalRenamings.py csvpath originalFileDir")
    quit()


reader = UnicodeReader(open(csv_path))

ignored = set([])

#Key: file, line, token_id -> row
renameMap = {}
fileKeys = {}

for row in reader:
    #filename,renaming_strat,consistency_strat,scope_id,line_index,token_id_per_line,isGlobal,Choosen_Renaming,list_of_renamings
    file_name = row[0]
    rename_strat = row[1]
    if(rename_strat == "n2p"): #skip jsnice lines
        continue
    line_index = int(row[4])
    line_tok_id = int(row[5])
    is_global = row[6]
    if(is_global == True): #skip globals
        continue

    var_key = (file_name, line_index, line_tok_id)
    if(file_name in fileKeys):
        fileKeys[file_name].append(var_key)
    else:
        fileKeys[file_name] = [var_key]
        
    renameMap[var_key] = row

print("-------------------------------------")
ignored = []
newRow = []
i = 0
with open("compareOrigWithTool.csv", "w") as f:
    f.write("filename;renaming_strat;consistency_strat;scope_id;line_index;token_line_id;is_global;choosen_renaming;suggestion_list;orig_name;obs_name;was_obs;in_suggest;lc_suggest;nspec_suggestion;contain_suggest;abbrev_suggest\n")
    for file_name, var_list in fileKeys.iteritems():
        #process file
        ib = processFile(os.path.join(orig_dir,file_name))
        ib_obs = processObsFile(os.path.join(orig_dir,file_name))
        #get name for line_index, token_id
        #print(ib)
        #print(ib_obs)
        #print(ib.charPosition2Name)
        for next_var in var_list:
            #if(True):
            try:
                #TODO: Also need the obsfuscated name to make sure that we're actually translating back
                #print(renameMap[next_var])
                orig_name = getVarAt(next_var, ib)
                obs_name = getVarAt(next_var, ib_obs)
                newRow = renameMap[next_var]
                in_suggest = suggestionExactMatch(newRow[8],orig_name)
                (lc_suggest, nspec_suggest, contains_suggest, abbrev_suggest) = suggestionApproximateMatch(newRow[8],orig_name)
                #print(newRow)
                #if(i > 15):
                #    break
                #i += 1
                f.write(";".join(newRow + [orig_name, obs_name,str(orig_name != obs_name),str(in_suggest),str(nspec_suggest),str(contains_suggest),str(abbrev_suggest)]) + "\n")
            except:
                ignored.append(newRow)
        #break 

    
print(len(ignored))
print(ignored)
with open("ignored.csv", "w") as f:
    for row in ignored:
        f.write(";".join([r.encode("utf8") for r in row]) + "\n")


#Tests:
#Is the original name in the suggestion list?
#How far
