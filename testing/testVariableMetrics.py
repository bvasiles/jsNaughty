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
        #TODO: Automated checks against the files.  
        #Known bugs:  The definitions of sum and numberEquals in test_file1 seem to be pointing to the wrong instance...
        
        for nextFile in self.fileList:
            print(nextFile)
            lexed = Lexer(nextFile)
            ib = IndexBuilder(lexed.tokenList)
            sa = ScopeAnalyst(nextFile)
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
            break
        
    
if __name__=="__main__":
    unittest.main()