import sys
import os
import argparse
import csv
import ntpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import Lexer, ScopeAnalyst
from folderManager.folder import Folder
from unicodeManager import UnicodeReader, UnicodeWriter
from experiments import MosesClient
from experiments import TransType

source_path = "./"
output_path = "./"


if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--source_path",action="store", type=str,
        desc="The source directory where the files are stored.")
    parser.add_argument("-o", "--output_path",action="store", type=str,
        desc="Where to put the output files.")
    parser.add_argument("-start",action="store", type=int, default = 0, 
        desc="A starting index for which file to process next " + 
        "(i.e. start at kth file in list).  Used for restarting after crash.")

    args = parser.parse_args()
    source_folder = Folder(os.path.abspath(args.source_path))
    output_folder = Folder(args.output_path).create()

    self.client = MosesClient(args.output_path)
    
    c_path = 'candidates.csv'
    flog = 'log_test_' + os.path.basename(source_path)
    
    with open(os.path.join(output_path, flog), 'w') as g, \
            open(os.path.join(output_path, c_path), 'w') as c:
        pass
    
    test_files = source_folder.fullFileNames("*.u.js", recursive=False)
    ensemble = [TransType.NEURAL_SEQ_TAG]#, TransType.Both]
    use_mix = [False, True]
    i = 0
    restart_attempt = False

    for nextFile in test_files:
        if(i < id_start): # Skip until at start ID (used in failure cases)
            i += 1
            continue
        reader = UnicodeReader(f)
        js_text = open(nextFile, 'r').read()
        
        #Loop over ensemble methods?
        for method in ensemble:
            for mix in use_mix:
                result = self.client.deobfuscateJS(js_text,mix,12345,ensemble,False,False,True,True)
            
                with open(os.path.join(output_path, flog), 'a') as g, \
                            open(os.path.join(output_path, c_path), 'a') as c:
                    writer = UnicodeWriter(g)
                    cw = UnicodeWriter(c)
             
                    if result[0] is not None:
                        translation, js_err, candidates, performance = result
                        
                        writer.writerow([js_file_path, ok])
                        
                        for r in candidates:
                            cw.writerow([js_file_path]+
                                        [str(x).replace("\"","") for x in r])
                    else:
                        writer.writerow([result[0], result[2]])


        i +=1
