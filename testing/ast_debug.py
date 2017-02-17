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


class testAST(unittest.TestCase):
 
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
        #Known bugs:  The definitions of sum and numberEquals in test_file1 seem to be pointing to the wrong instance...
        i = 1
        lexed = Lexer(self.fileList[0])
        ib = IndexBuilder(lexed.tokenList)        
        sa = ScopeAnalyst(self.fileList[0])
        for variable in sa.nameDefScope2pos.keys():
            print(str(variable[0]) + " : " + str(sa.nameDefScope2pos[variable]) + " -> " +  str(ib.revFlatMat[sa.nameDefScope2pos[variable]]))
        
    
if __name__=="__main__":
    unittest.main()