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
        
    try:
        lexer = Lexer(os.path.join(results_path, js_file_name))
        return lexer.tokenlist
    except:
        print('Lexer fail')
        return []

def getVarAt(var_tuple, tokens):
    '''
    Given a tuple (file_name, line_id, token_id_in_line) and a pygments token list for a file
    1) Check that the token on line line_id and index token_id_in_line is a variable
    2) return the original token name
    '''
    ib = IndexBuilder(tokens)
    line_char_index = ib.revFlatMap((var_tuple[1], var_tuple[2]))
    return ib.charPosition2Name(line_char_index)


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
    if(rename_strat == "n2p"): #skip jsnice lines
        continue
    line_index = row[4]
    line_tok_id = row[5]
    is_global = row[6]
    if(is_global == True): #skip globals
        continue
    
    var_key = (file_name, line_index, line_tok_id)
    if(filename in fileKeys):
        fileKeys[file_name].append(var_key)
    else:
        fileKeys[file_name] = [var_key]
        
    renameMap[var_key] = row


with open("compareOrigWithTool.csv", "w") as f:
    for file_name, var_list in fileKeys.iteritems():
        #process file
        file_tokens = processFile(file_name)
        #get name for line_index, token_id
        for next_var in var_list:
            orig_name = getVarAt(next_var, file_tokens)
            newRow = renameMap[next_var].append(orig_name)
            f.write(",".join(rewRow) + "\n")
        
    
#Tests:
#Is the original name in the suggestion list?
#How far