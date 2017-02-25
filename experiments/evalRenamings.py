import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from unicodeManager import UnicodeReader, UnicodeWriter
import multiprocessing
from tools import ScopeAnalyst, Lexer, IndexBuilder
from evalRenamingHelper import *


try:
    csv_path = os.path.abspath(sys.argv[1])
    orig_dir = os.path.abspath(sys.argv[2])
except:
    print("usage: python evalRenamings.py csvpath originalFileDir output_file")
    quit()


reader = UnicodeReader(open(csv_path))

ignored = set([])

#Key: file, line, token_id -> row
renameMap = {}
fileKeys = {}
jsnice_rows = []

for row in reader:
    #filename,renaming_strat,consistency_strat,scope_id,line_index,token_id_per_line,isGlobal,Choosen_Renaming,list_of_renamings
    file_name = row[0]
    rename_strat = row[1]
    consistency_strat = row[2]
    #if(rename_strat == "n2p"): #skip jsnice lines
    #    jsnice_rows.append(row)
    #    continue
    line_index = int(row[4])
    line_tok_id = int(row[5])
    is_global = row[6]
    if(is_global == 'True'): #skip globals
        continue

    var_key = (file_name, rename_strat, consistency_strat,  line_index, line_tok_id)
    if(file_name in fileKeys):
        fileKeys[file_name].append(var_key)
    else:
        fileKeys[file_name] = [var_key]
        
    renameMap[var_key] = row
    #print(row)
#quit()
print("-------------------------------------")
ignored = []
newRow = []
i = 0
with open(output_file, "w") as f:
    f.write("filename;renaming_strat;consistency_strat;scope_id;line_index;token_line_id;is_global;choosen_renaming;suggestion_list;orig_name;obs_name;was_obs;in_suggest;lc_suggest;nspec_suggestion;contain_suggest;abbrev_suggest;approx_correct\n")
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
                
                if(newRow[1] != "n2p"):
                    in_suggest = suggestionExactMatch(newRow[8],orig_name)
                    (lc_suggest, nspec_suggest, contains_suggest, abbrev_suggest) = suggestionApproximateMatch(newRow[8].split(","),orig_name)
                else:
                    in_suggest = "NA"
                    (lc_suggest, nspec_suggest, contains_suggest, abbrev_suggest) = ("NA", "NA", "NA", "NA")
                
                (a,b,c,d) = suggestionApproximateMatch([newRow[7]], orig_name)
                approx_correct = a or b or c or d
                
                #print(newRow)
                #if(newRow[2] !="freqlen"):
                #    quit()
                #i += 1
                f.write(";".join(newRow + [orig_name, obs_name,str(orig_name != obs_name),str(in_suggest),str(lc_suggest),str(nspec_suggest),str(contains_suggest),str(abbrev_suggest),str(approx_correct)]) + "\n")
            except:
                ignored.append(newRow)
        #break 

    #Add the jsnice rows back in (note, this means I need to add the orig_name and obs_name cols to these in R
    #for nextRow in jsnice_rows:
    #    #Fill in the first three of these along with the final one.
    #    #orig_name;obs_name;was_obs ---> approx_correct.
    #    f.write(";".join(nextRow + ["NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA" ]) + "\n")

    
print(len(ignored))
print(ignored)
with open("ignored.csv", "w") as f:
    for row in ignored:
        f.write(";".join([r.encode("utf8") for r in row]) + "\n")


#Tests:
#Is the original name in the suggestion list?
#How far
