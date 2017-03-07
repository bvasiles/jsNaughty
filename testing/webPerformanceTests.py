import unittest
import sys
import os
import csv
import ntpath
import argparse
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import Lexer, ScopeAnalyst
from folderManager.folder import Folder
from unicodeManager import UnicodeReader, UnicodeWriter
from experiments import MosesClient

id_start = 0

class defobfuscate_tests(unittest.TestCase):
    
    def getFileId(self, filename):
        '''
        Given a file path of the form [/.../.../]<num>.<exts>
        Return <num>
        Assumes there are no "/" in <exts>, but may be "." in the directory path if its included.
        '''
        base = ntpath.basename(filename)
        return int(base[:base.find(".")])

    def fileSort(self,fileList):
        '''
        Ensure that the list of files is sorted - e.g. test_file1 test_file2, etc.
        '''
        return sorted(fileList, key = lambda(x) : int(x[:x.find(".")]))
    
    def setUp(self):
        self.testDir = Folder("/data/bogdanv/js_files/")
        self.id_list = []
        with open("./experiments/samples/stress.csv", 'r') as f:
            for next_id in f:
                self.id_list.append(next_id.strip())
        print(self.id_list)
        
        self.clearTextFiles = self.fileSort(self.id_list)
        print("Files: " + str(self.clearTextFiles))
        self.clearTextFiles = [os.path.join(self.testDir.path, file) for file in self.clearTextFiles]
        self.client = MosesClient("./testing/performance_output/")
        
    def testMosesPerformance(self):
        '''
        Run the deobfuscateJS method on each of our files and record what the 
        times were for each into a csv style report.
        '''
        i = 0
        restart_attempt = False
        with open("./testing/PerformanceMetrics" + str(id_start)  + ".csv", 'w') as output_csv:
            writer = csv.writer(output_csv, delimiter = ",")
            writer.writerow(["file","lines","minifiable_instances","jsnice_status",
                             "preprocess_time","jsnice_time","renaming_time","moses_time","postprocessing_time"])
            for next_file in self.clearTextFiles:
                if(i < id_start): # Skip until at start ID (used in failure cases)
                    i += 1
                    continue
                text = open(next_file, 'r').read()
                lineCount = text.count("\n") + 1
                print(lineCount)
                #if(lineCount > 700): #Bogdan didn't count these correctly? or was counting SLOC?
                #    continue

                try:
                    sa = ScopeAnalyst(next_file)
                    minCount = len(sa.name2defScope)
                    result = self.client.deobfuscateJS(text,i,False)
                    if("Moses server failed" in result[0]):
                        #Skip and wait for revival scrip to restart the server?
                        if(not restart_attempt):
                            restart_attempt = True
                            #Wait 10 minutes for restarting script to try to boot up servers again
                            #Only do this once per server crash.
                            time.sleep(10*60)
                    else:
                        restart_attempt = False #Server is working, make sure we reset restarter flag if needed    
                except:
                    minCount = 0
                    result = [text, "other error.", 0, 0, 0, 0, 0]
                i += 1
                
                #Write output to a separate file.
                file_id = str(self.getFileId(next_file))
                output_file = file_id + ".out.js"
                with open(os.path.join("./testing/performance_output/", output_file), "w") as f2:
                    f2.write(result[0])
                #Write js_error + times to csv.
                writer.writerow([file_id,lineCount, minCount] + list(result[1:]))
                #if(i > 2):
                #    break                
            



if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-start",action="store", type=int, default = 0)
    parser.add_argument("unittest_args", nargs="*")
    args = parser.parse_args()
    id_start = args.start

    sys.argv[1:] = args.unittest_args
    unittest.main()
