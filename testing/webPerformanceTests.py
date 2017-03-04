import unittest
import sys
import os
import csv
import ntpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))

from folderManager.folder import Folder
from unicodeManager import UnicodeReader, UnicodeWriter
from experiments import MosesClient


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
        with open("./testing/PerformanceMetrics.csv", 'w') as output_csv:
            writer = csv.writer(output_csv, delimiter = ",")
            for next_file in self.clearTextFiles:
                text = open(next_file, 'r').read()
                lineCount = text.count("\n")
                result = self.client.deobfuscateJS(text,i,False)
                i += 1
                
                #Write output to a separate file.
                output_file = str(self.getFileId(next_file)) + ".out.js"
                with open(os.path.join("./testing/performance_output/", output_file), "w") as f2:
                    f2.write(result[0])
                #Write js_error + times to csv.
                writer.writerow([lineCount] + list(result[1:]))
                if(i > 5):
                    break                
            



if __name__=="__main__":
    unittest.main()
