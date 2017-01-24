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

ignored = []
newRow = []
with open("compareOrigWithTool.csv", "w") as f:
    f.write("filename;renaming_strat;consistency_strat;scope_id;line_index;token_line_id;is_global;choosen_renaming;suggestion_list;orig_name;obs_name;was_obs")
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
                newRow.append(orig_name)
                newRow.append(obs_name)
                if(orig_name == obs_name):
                    newRow.append("False")
                else:
                    newRow.append("True")
                #print(newRow)
                f.write(";".join(newRow) + "\n")
            except:
                ignored.append(newRow)
    
print(len(ignored))
print(ignored)
with open("ignored.csv", "w") as f:
    for row in ignored:
        f.write(";".join([r.encode("utf8") for r in row]) + "\n")


#Tests:
#Is the original name in the suggestion list?
#How far
