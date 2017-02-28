#scopeAnalyst drops some global names from consideration
#We must resolve this with indexBuilder -> unique names
#in name2CharPositions that don't appear in isGlobal
#are unminifiable.

#Input: directory of files, output_csv_name
#Output: output of csv: file_id.js, glb_count
import sys
import os
import re

import csv
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
#from tools import IndexBuilder, ScopeAnalyst, Lexer
from unicodeManager import UnicodeReader, UnicodeWriter
from pygments.token import Token, String, is_token_subtype
from tools import Preprocessor, WebPreprocessor, Postprocessor, Beautifier, Lexer, WebLexer, IndexBuilder, ScopeAnalyst, VariableMetrics
# from experiments.renamingStrategies import renameUsingHashDefLine
from folderManager.folder import Folder
import multiprocessing


def processFile(l):
    base_name = l[0]
    js_file_path = l[1]
    print(base_name)
    print(js_file_path)
    #if(True):
    try:
        lexed = Lexer(js_file_path)
        ib = IndexBuilder(lexed.tokenList)
        sa = ScopeAnalyst(js_file_path)
        #num globals = all in is_global == True + all unique names
        #in name2CharPositions not in is_global
        base_global = set([name for name, value in sa.isGlobal.iteritems() if value == True])
        #Get all known names in the file.
        known_names = set([name for name, value in sa.isGlobal.iteritems()])
        for name, loc in ib.name2CharPositions.iteritems():
            if(name not in known_names): #if never seen, its a global
                base_global.add(name)
                
        return [base_name, len(base_global)]
    except:
        return [base_name, None]

input_dir = sys.argv[1]
output_csv = sys.argv[2]
num_threads = int(sys.argv[3])

base_dir = Folder(input_dir)
fileList = base_dir.baseFileNames("*.js")
origList = [next for next in fileList if next.count(".") == 1]
toProcess = [(nextFile, os.path.join(base_dir.path, nextFile)) for nextFile in origList]

#print(fileList)
with open(output_csv, 'w') as g:
    pass
pool = multiprocessing.Pool(processes=num_threads)
    
for result in pool.imap_unordered(processFile, toProcess):

#for file_pair in toProcess:
#    result = processFile(file_pair)
    print(result[0])
    with open(output_csv, 'a') as g:
        writer = UnicodeWriter(g)
 
        if result[1] is not None:
            writer.writerow(result)
        else:
            writer.writerow([result[0], "error"])
   
#    break
