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
        return sorted(fileList, key = lambda(x) : int(x[9:x.find(".")]))
    
    def setUp(self):
        self.testDir = Folder("./testing//test_files/")
        self.fileList = self.fileSort(self.testDir.baseFileNames("*.orig.js"))
        self.fileList = [os.path.join(self.testDir.path, nextFile) for nextFile in self.fileList]
        print("FileList:")
        print(self.fileList)
        
        #Manual solutions:
        self.file_definitions = {}
        self.file_definitions[1] = {}
        self.file_definitions[1]["geom2d"] = [0]
        self.file_definitions[1]["sum"] = [1]
        self.file_definitions[1]["numeric"] = [1]
        self.file_definitions[1]["numberEquals"] = [1]
        self.file_definitions[1]["a"] = [2]
        self.file_definitions[1]["Vector2d"] = [3]
        self.file_definitions[1]["dotProduct"] = [8]
        self.file_definitions[1]["equals"] = [11]
        self.file_definitions[1]["mix"] = [15]
        self.file_definitions[1]["k"] = [16]
        self.file_definitions[1]["vector"] = [8,11]
        self.file_definitions[1]["x"] = [3]
        self.file_definitions[1]["y"] = [3]
        self.file_definitions[1]["epsilon"] = [11]
        self.file_definitions[1]["dest"] = [15]
        self.file_definitions[1]["src"] = [15]
        
        self.file_definitions[5] = {}
        self.file_definitions[5]["button"] = [5,19]
        self.file_definitions[5]["e"] = [5,19]
        self.file_definitions[5]["options"] = [5,19]
        self.file_definitions[5]["win"] = [6]
        self.file_definitions[5]["frm"] = [7]
        self.file_definitions[5]["store"] = [8]
        self.file_definitions[5]["customer"] = [10,22] #Sometimes global, so the 10 doesn't really matter?
        self.file_definitions[5]["grid"] = [22,29]
        self.file_definitions[5]["cp"] = [23,30]
        self.file_definitions[5]["Ext"] = [0]
        self.file_definitions[5]["mode"] = [9]
        
        self.file_definitions[6] = {}
        self.file_definitions[6]["feather"] = [0]
        self.file_definitions[6]["cardmagic"] = [3]
        self.file_definitions[6]["newCard"] = [9]
        self.file_definitions[6]["nPlayerId"] = [9]
        
        self.file_definitions[7] = {}
        self.file_definitions[7]["require"] = [0]
        self.file_definitions[7]["fs"] = [0]
        self.file_definitions[7]["path"] = [2]
        self.file_definitions[7]["__dirname"] = [2]
        self.file_definitions[7]["ignoreList"] = [2]
        self.file_definitions[7]["describe"] = [4]
        self.file_definitions[7]["done"] = [5]
        self.file_definitions[7]["it"] = [5]
        self.file_definitions[7]["err"] = [6]
        self.file_definitions[7]["file"] = [6]
        
        self.file_definitions[8] = {}
        self.file_definitions[8]["module"] = [0]
        self.file_definitions[8]["testCompile"] = [2,8]
        self.file_definitions[8]["promise"] = [5,11]
        self.file_definitions[8]["anonymous"] = [2,4,8,10] # I don't know if I agree with this?
        
        self.file_definitions[9] = {}
        self.file_definitions[9]["document"] = [0]
        self.file_definitions[9]["studentSelector"] = [1]
        self.file_definitions[9]["courseSelector"] = [1]
        self.file_definitions[9]["$"] = [0] #The other ones aren't?
        self.file_definitions[9]["data"] = [4,12]
        self.file_definitions[9]["i"] = [5,13]
        self.file_definitions[9]["s"] = [5]
        self.file_definitions[9]["student"] = [6,14]
        self.file_definitions[9]["t"] = [13]
        #self.file_definitions[9]["tablesorter"] = [20]
        #self.file_definitions[9]["sortList"] = [21]
        self.file_definitions[9]["studentRows"] = [35]
        self.file_definitions[9]["filterButtons"] = [35]
        self.file_definitions[9]["e"] = [36]
        #self.file_definitions[9]["on"] = [36]
        self.file_definitions[9]["activeRows"] = [37]
        self.file_definitions[9]["inactiveRows"] = [37]
        self.file_definitions[9]["grade"] = [37]
        #self.file_definitions[9]["filter"] = [42]

    def testFiles(self):
        tf = [1,5,6,7,8,9]
        #tf = [10]

        for i in tf:
            print("-----------------------------------------------------")
            lexed = Lexer(self.fileList[i-1])
            ib = IndexBuilder(lexed.tokenList)        
            sa = ScopeAnalyst(self.fileList[i-1])
            #print(sa)
            for variable in sa.nameDefScope2pos.keys():
                print(str(variable[0]) + " : " + str(sa.nameDefScope2pos[variable]) + " -> " +  str(ib.revFlatMat[sa.nameDefScope2pos[variable]]) + " Manual: " + str(self.file_definitions[i][variable[0]]))
                assert(ib.revFlatMat[sa.nameDefScope2pos[variable]][0] in self.file_definitions[i][variable[0]])
        
    
if __name__=="__main__":
    unittest.main()