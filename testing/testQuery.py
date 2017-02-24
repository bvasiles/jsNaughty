import unittest
import sys
import os

import csv
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))

from tools.lmQuery import LMQuery
from folderManager.folder import Folder


class testLmQuery(unittest.TestCase):
    
 
    def setUp(self):
        self.testDir = Folder("./testing/test_files/")
        self.fileList = self.testDir.baseFileNames("*.querytest")
        self.fileList = [os.path.join(self.testDir.path, nextFile) for nextFile in self.fileList]
        print("FileList:")
        print(self.fileList)

    def testFiles(self):
        q = LMQuery("/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.500k/js.blm.lm")
        for file in self.fileList:
            with open(file, 'r') as f:
                for line in f:
                    prob1 = q.run(line)
                    prob2 = q.queryServer(line)
                    self.assertAlmostEqual(prob1, prob2, places = 4)
    
if __name__=="__main__":
    unittest.main()
