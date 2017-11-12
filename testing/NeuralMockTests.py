import unittest
import sys
import os
import csv
import ntpath
import argparse
import time
#import cProfile
from pstats import Stats
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import Lexer, ScopeAnalyst
from folderManager.folder import Folder
from unicodeManager import UnicodeReader, UnicodeWriter
from experiments import MosesClient

source_file = "testing/test_files/test_file1.obs.js"

class defobfuscate_tests(unittest.TestCase):
          
    def testOutput(self):
        '''
        Run an get the result on a file.
        '''
        result = self.client.deobfuscateJS(text,True,12345,False,False,True) #For timings
        
            

if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-source_file",action="store", type=string)

    args = parser.parse_args()
    source_file = args.source_file

    unittest.main()
