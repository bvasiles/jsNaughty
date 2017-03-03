import unittest
import sys
import os
import re

import csv
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
        return sorted(fileList, key = lambda(x) : int(x[9:x.find(".")]))
    
    def setUp(self):
        #self.testDir = Folder("./testing//test_files/")
        loc = "/data/bogdanv/deobfuscator/experiments/results/final.sample.test.2k.v2.nonmix.merged/"
        self.fileList = ["226369","5162081","1720575","279541","4780702"]
        self.fileList = [loc + item for item in self.fileList]
        self.ids = [".hash_def_one_renaming.logmodel", ".n2p"]
        print(self.fileList)
        
    def testfileDebug(self):
        for f in self.fileList:
            print("---------------------------------- " + f + " ----------------------------------")
            orig = f + ".js"
            min = f + ".u.js"
            lo = Lexer(orig)
            lm = Lexer(min)
            print("---------------------------------- original text ----------------------------------")
            print(lo.programText)
            print("---------------------------------- minified text ----------------------------------")
            print(lm.programText)
            for id in self.ids:
                to_read = f + id + ".js"
                print("---------------------------------- " + to_read + " ----------------------------------")
                lexed = Lexer(to_read)
                print("---------------------------------- text ----------------------------------")
                print(lexed.programText)
                print("---------------------------------- tokenlist ----------------------------------")
                print(lexed.tokenList)
                ib = IndexBuilder(lexed.tokenList)
                print("---------------------------------- IndexBuilder ----------------------------------")
                print(ib)
                sa = ScopeAnalyst(to_read)
                print("---------------------------------- ScopeAnalyst ----------------------------------")
                print(sa)
                
if __name__=="__main__":
    unittest.main()
