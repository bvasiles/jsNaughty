import unittest
import sys
import os
import re
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
    
    def setUp(self):
        self.testDir = Folder("./test_files/")
        self.fileList = self.testDir.baseFileNames("*.orig.js")
        self.fileList = [os.path.join(self.testDir.path, nextFile) for nextFile in self.fileList]
        print("FileList:")
        print(self.fileList)

    def testFiles(self):
        for nextFile in self.fileList:
            print(nextFile)
            lexed = Lexer(nextFile)
            ib = IndexBuilder(lexed.tokenList)
            sa = ScopeAnalyst(nextFile)
            vm = VariableMetrics(sa, ib, lexed.tokenList)
            print("VM----------------------------------------------------------------")
            print(vm)
            print("VM----------------------------------------------------------------")
            for var in vm.getVariables():
                print(var)
                print vm.getNameMetrics(var)
        
    
if __name__=="__main__":
    unittest.main()