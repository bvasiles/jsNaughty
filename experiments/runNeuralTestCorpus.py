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

def getFileId(filename):
    '''
    Given a file path of the form [/.../.../]<num>.<exts>
    Return <num>
    Assumes there are no "/" in <exts>, but may be "." in the directory path if its included.
    '''
    base = ntpath.basename(filename)
    return int(base[:base.find(".")])


def extName(mix, method):
   '''
   Given a boolean and an enum, create an appropriate short name.
   '''
   short = ""
   if(method == TransType.JSNAUGHTY):
       short = "jsn"
   elif(method == TransType.NEURAL_SEQ_TAG):
       short = "nst"
   elif(method == TransType.BOTH):
       short = "both"
   else:
       raise TypeError("%s is not a valid TransType" % (str(method)))

   if(mix):
       print("MIX2:" + str(mix))
       short += "_mix"

   return short

source_path = "./"
output_path = "./"


parser = argparse.ArgumentParser()
parser.add_argument("-s", "--source_path",action="store", type=str,
    help="The source directory where the files are stored.")
parser.add_argument("-o", "--output_path",action="store", type=str,
    help="Where to put the output files.")
parser.add_argument("-start",action="store", type=int, default = 0, 
    help="A starting index for which file to process next " + 
    "(i.e. start at kth file in list).  Used for restarting after crash.")
parser.add_argument("-stop", action="store", type=int, default =2150,
    help = "Stopping index for doing a subset of the test.")
parser.add_argument("--reset", action="store_true", default= False,
    help = "Flag to reset the candidates and log files.")


args = parser.parse_args()

output_path = os.path.abspath(args.output_path)
source_path = os.path.abspath(args.source_path)
source_folder = Folder(source_path)
output_folder = Folder(output_path).create()
id_start = args.start
id_stop = args.stop
reset = args.reset

client = MosesClient(args.output_path)

c_path = 'candidates.csv'
flog = 'log_test_' + os.path.basename(source_path)

print("Log file: " + os.path.join(output_path, flog))
print("Candidates file:" +os.path.join(output_path, c_path))

if(reset == True):
    print("Reseting")
    with open(os.path.join(output_path, flog), 'w') as g, \
            open(os.path.join(output_path, c_path), 'w') as c:
        pass

test_files = source_folder.fullFileNames("*.u.js", recursive=False)
#Guarantee an order of the files.
test_files = sorted(test_files)
#print(test_files)
#quit()
#ensemble = [TransType.NEURAL_SEQ_TAG]#, TransType.BOTH]
#ensemble = [TransType.BOTH]
ensemble = [TransType.JSNAUGHTY]
use_mix = [False, True]
i = 0
restart_attempt = False #Add in later when doing jsnaughty mixes

print(test_files)

for nextFile in test_files:
    if(i < id_start): # Skip until at start ID (used in failure cases)
        i += 1
        print(str(i) + ":" + nextFile)
        continue

    if(i > id_stop):
        print("Stopping at id" + str(i))
        break
    nf = open(nextFile, 'r')
    js_text = nf.read()
    nf.close()
    fileLogName = ntpath.basename(nextFile).replace(".u.", ".")
    
    #Loop over ensemble methods?
    for method in ensemble:
        for mix in use_mix:
            if(mix != False):
                continue

            print("Processing %s Ensemble %s Mix %s" % (fileLogName, method, mix))
            
            try:
                #print("MIX:" + str(mix))
                #result = client.deobfuscateJS(js_text,mix,0,method,True,True,True,True) #Debug Version
                result = client.deobfuscateJS(js_text,mix,0,method,False,True,True,True)
                print(result)
            except Exception, e:
                print("Deobfuscate crashed.")
                result = ["DeobfuscateJS failed: " + str(e)]
        
            with open(os.path.join(output_path, flog), 'a') as g, \
                        open(os.path.join(output_path, c_path), 'a') as c:
                writer = UnicodeWriter(g)
                cw = UnicodeWriter(c)
                
                try:
                    if not result[0].endswith("Failed"):
                        print(result)
                        print(len(result))
                        translation, js_err, candidates, performance = result #This is regularly crashing?
                    
                        #Create the translated file...
                        file_id = str(getFileId(nextFile))
                        shortName = extName(mix, method)
                        output_file = file_id + "." + shortName  + ".js"
                        with open(os.path.join(output_path, output_file), 'w') as f:
                            f.write(translation)
                        writer.writerow([fileLogName, "OK"])
                    
                        for r in candidates:
                            #Point the candidate to the correct original file?
                            row = [fileLogName] + [str(x).replace("\"","") for x in r]
                            row[1] = shortName
                            cw.writerow(row)
                    else:
                        writer.writerow([fileLogName, result[0]])

                except:
                    writer.writerow([fileLogName, result[0]])
    i +=1

#Remove temp file.
os.remove(os.path.join(output_path, "0.u.js"))
