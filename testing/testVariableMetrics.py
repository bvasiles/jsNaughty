import unittest
import sys
import os
import re
import csv
from _sqlite3 import Row
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
#from tools import IndexBuilder, ScopeAnalyst, Lexer
from pygments.token import Token, String, is_token_subtype
from tools import Preprocessor, WebPreprocessor, Postprocessor, Beautifier, Lexer, WebLexer, IndexBuilder, ScopeAnalyst, VariableMetrics
# from experiments.renamingStrategies import renameUsingHashDefLine
from folderManager.folder import Folder
# from experiments.mosesClient import writeTmpLines
# from experiments.postprocessUtil import processTranslationScoped, processTranslationUnscoped, processTranslationScopedServer


class scopeNameTest(unittest.TestCase):
    
    def asBool(self, string):
        return string in ["TRUE", "true", "True", "t", "T", "1"]
    
    def fileSort(self,fileList):
        '''
        Ensure that the list of files is sorted - e.g. test_file1 test_file2, etc.
        '''
        return sorted(fileList, key = lambda(x) : int(x[9:10]))
    
    def setUp(self):
        self.testDir = Folder("./testing//test_files/")
        self.fileList = self.fileSort(self.testDir.baseFileNames("*.orig.js"))
        self.fileList = [os.path.join(self.testDir.path, nextFile) for nextFile in self.fileList]
        print("FileList:")
        print(self.fileList)

    def testFiles(self):
        #TODO: Automated checks against the files.  
        #Known bugs:  The definitions of sum and numberEquals in test_file1 seem to be pointing to the wrong instance...
        i = 1
        for nextFile in self.fileList:
            print(nextFile)
            lexed = Lexer(nextFile)
            ib = IndexBuilder(lexed.tokenList)
            sa = ScopeAnalyst(nextFile)
            s_min = ScopeAnalyst("/Users/caseycas/jsnaughty/testing/test_files/test_file1.obs.js")
            print(s_min.name2defScope)
            print("TokenList----------------------------------------------------------------")
            print(lexed.tokenList)
            print("Index Builder----------------------------------------------------------------")
            print(ib)
            print("Scope Analyst----------------------------------------------------------------")
            print(sa)
            vm = VariableMetrics(sa, ib, lexed.tokenList)
            print("VM----------------------------------------------------------------")
            print(vm)
            print("VM----------------------------------------------------------------")
            for var in vm.getVariables():
                print(var)
                print("Num Lines,Max Lines,Global Def,Global Usage,For,While,Literal Def,Literal Usage,Max Length Line,Ave Line Length")
                print vm.getNameMetrics(var)
            
            #Automated tests:
            csv_file = os.path.join(self.testDir.path, "test_file" + str(i) + ".csv")
            print(csv_file)
            if(os.path.exists(csv_file)):
                with open(csv_file, 'r') as f:
                    csv_reader = csv.reader(f, delimiter = ",")
                    #Skip header
                    next(csv_reader, None)
                    for row in csv_reader:
                        key = (row[0], row[1])
                        print(key)
                        (num_lines, max_lines, external_def, external_use, in_for, in_while, literal_def, literal_use, max_length_line, ave_line_length) = vm.getNameMetrics(key)
                        self.assertTrue(num_lines == int(row[2]))
                        self.assertTrue(max_lines == int(row[3]))
                        self.assertTrue(external_def == self.asBool(row[4]))
                        self.assertTrue(external_use == int(row[5]))
                        self.assertTrue(in_for == int(row[6]))
                        self.assertTrue(in_while == int(row[7]))
                        self.assertTrue(literal_def == self.asBool(row[8]))
                        self.assertTrue(literal_use == int(row[9]))
                        self.assertTrue(max_length_line == int(row[10]))
                        self.assertAlmostEqual(ave_line_length, float(row[11]), places = 3)

                        
            else:
                print("no manually annotated csv file for: " + nextFile)

                
            break
        
    
if __name__=="__main__":
    unittest.main()