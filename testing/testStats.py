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
        loc = "/data/bogdanv/js_files"
        self.fileList = ["226369","5162081","1720575","279541","4780702"]
        self.ids = [".hash_def_one_renaming.logmodel", ".n2p"]
        print(self.fileList)
        
    def testfileDebug(self):
        for f in self.fileList:
            print("---------------------------------- " + f + " ----------------------------------")
            orig = f + ".js"
            orig_text = ""
            min = f + ".u.js"
            min_text = ""
            with open(orig, 'r') as input_file:
                orig_text = input_file.readlines()
            with open(min, 'r') as input_file:
                min_text = input_file.readlines()
            print("---------------------------------- original text ----------------------------------")
            print(orig_text)
            print("---------------------------------- minified text ----------------------------------")
            print(min_text)
            for id in self.ids:
                to_read = f + id + ".js"
                print("---------------------------------- " + to_read + " ----------------------------------")
                text = ""
                with open(to_read, 'r') as input_file:
                    text = input_file.readlines()
                print("---------------------------------- text ----------------------------------")
                print(text)
                lexed = Lexer(input_file)
                print("---------------------------------- tokenlist ----------------------------------")
                print(lexed.tokenlist)
                ib = IndexBuilder(lexed.tokenlist)
                print("---------------------------------- IndexBuilder ----------------------------------")
                print(ib)
                sa = ScopeAnalyst(input_file)
                print("---------------------------------- ScopeAnalyst ----------------------------------")
                print(sa)
                
if __name__=="__main__":
    unittest.main()