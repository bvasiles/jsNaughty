import unittest
import sys
import os
import ntpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
#from tools import IndexBuilder, ScopeAnalyst, Lexer
from pygments.token import Token, String, is_token_subtype
from tools import Preprocessor, WebPreprocessor, Postprocessor, Beautifier, Lexer, WebLexer, IndexBuilder, ScopeAnalyst, LMQuery
# from experiments.renamingStrategies import renameUsingHashDefLine
from folderManager.folder import Folder
# from experiments.mosesClient import writeTmpLines
# from experiments.postprocessUtil import processTranslationScoped, processTranslationUnscoped, processTranslationScopedServer
from tools import prepHelpers, MosesParser, ConsistencyResolver, \
                    TranslationSummarizer, ConsistencyStrategies, \
                    PreRenamer, PostRenamer, RenamingStrategies


class scopeNameTest(unittest.TestCase):
    
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
        return sorted(fileList, key = self.getFileId)
    
    def removeFiles(self, originalList, ignoreSet, sharedSet):
        '''
        Remove all in originalList not in the shared set and record the removed ones in the ignoreList
        '''
        newList = [File for File in originalList if self.getFileId(File) in sharedSet]
        ignoreSet = ignoreSet.union([File for File in originalList if self.getFileId(File) not in sharedSet])
        return (newList, ignoreSet)

    def setUp(self):
        '''
        Don't run Moses server here (just incremental tests)
        - Take all the .orig test files and create the IndexBuilders and ScopeAnalysts here
        '''
        #self.testDir = Folder("/data/bogdanv/deobfuscator/experiments/results/sample.test.10k.v7/")
        self.testDir = Folder("./consistencyFailureFiles2/")
        '''
        3193021.hash_def_one_renaming.freqlen.js
        3193021.hash_def_one_renaming.js
        3193021.hash_def_one_renaming.lmdrop.js
        3193021.hash_def_one_renaming.lm.js
        3193021.js
        3193021.n2p.js
        3193021.no_renaming.freqlen.js
        3193021.no_renaming.js
        3193021.no_renaming.lmdrop.js
        3193021.no_renaming.lm.js
        3193021.u.js
        '''
        self.clearTextFiles = self.fileSort([js_file for js_file in self.testDir.baseFileNames("*.js") if js_file.count(".") == 1])
        self.clearTextFiles = [os.path.join(self.testDir.path, File) for File in self.clearTextFiles]
        print("Files: " + str(len(self.clearTextFiles)))
        
        self.obfuscatedTextFiles = self.fileSort(self.testDir.baseFileNames("*.u.js"))
        self.obfuscatedTextFiles = [os.path.join(self.testDir.path, File) for File in self.obfuscatedTextFiles]
        print("Obs files: " + str(len(self.obfuscatedTextFiles)))        

        self.renamings = ["hash_def_one_renaming", "no_renaming"]
        self.consistency = ["", "freqlen", "lmdrop", "lm"]
        self.renamedFilenameMap = {}
        #Retain a list of all the files we do have things for
        self.allSet = set([self.getFileId(clean) for clean in self.clearTextFiles]).intersection(set([self.getFileId(obs) for obs in self.obfuscatedTextFiles]))
        for r in self.renamings:
            for c in self.consistency:
                if(c != ""):
                    key = r + "." + c + ".js"
                else:
                    key = r + ".js"
                renamedFiles = [os.path.join(self.testDir.path, File) for File in self.fileSort(self.testDir.baseFileNames("*." + key))]
                self.allSet = self.allSet.intersection(set([self.getFileId(rename) for rename in renamedFiles]))
                #Remove any files from clear and obsfuscated that don't appear in
                print("Renamed files (" + key + "): " + str(len(renamedFiles)))
                self.renamedFilenameMap[key] = renamedFiles

        
        (self.clearTextFiles, self.IgnoreSet) = self.removeFiles(self.clearTextFiles, set(), self.allSet)
        print("Clear revised: " + str(len(self.clearTextFiles)))
        (self.obfuscatedTextFiles, self.IgnoreSet) = self.removeFiles(self.obfuscatedTextFiles, self.IgnoreSet, self.allSet)
        print("Obs revised: " + str(len(self.obfuscatedTextFiles)))
        for key, value in self.renamedFilenameMap.iteritems():
            (self.renamedFilenameMap[key], self.IgnoreSet) = self.removeFiles(value, self.IgnoreSet, self.allSet)
            print("key: " + str(len(self.renamedFilenameMap[key])))

        #print("---------------------------------")
        #print(self.renamedFilenameMap)
        #print("---------------------------------")
        with open("ignored.txt", 'w') as f:
            for skipped in self.IgnoreSet:
                f.write(str(skipped) + "\n")


    def compareFiles(self, originalFilename, obsFilename, renamedFilename):
        '''
        Provide the absolute path of the original Filename, the corresponding obsfuscated filename,
        and a renamed filename
        '''
        self.assertTrue(os.path.isabs(originalFilename) and os.path.isfile(originalFilename))
        self.assertTrue(os.path.isabs(obsFilename) and os.path.isfile(obsFilename))
        self.assertTrue(os.path.isabs(renamedFilename) and os.path.isfile(renamedFilename))
        lexedOrig = Lexer(originalFilename)
        lexedObs = Lexer(obsFilename)
        lexedRenamed = Lexer(renamedFilename)
        
        ib1 = IndexBuilder(lexedObs.tokenList)
        sa1 = ScopeAnalyst(obsFilename)
        '''
        (a_name_positions, 
             a_position_names) = prepHelpers(ib1, sa1)
        
        translation = self.postText[tC_ind]

        # Parse moses output
        mp = MosesParser()
        
        name_candidates = mp.parse(translation,
                                   ib1,
                                   a_position_names,
                                   sa1)
        # name_candidates is a dictionary of dictionaries: 
        # keys are (name, None) (if scopeAnalyst=None) or 
        # (name, def_scope) tuples (otherwise); 
        # values are suggested translations with the sets 
        # of line numbers on which they appear.
        
        cr = ConsistencyResolver()
        CS = ConsistencyStrategies()
        c_strategy = CS.FREQLEN
        
        temp_renaming_map = cr.computeRenaming(c_strategy,
                                                  name_candidates,
                                                  a_name_positions,
                                                  ib1,
                                                  lm_path)
                
#             # Fall back on original names in input, if 
#             # no translation was suggested
        postRen = PostRenamer()
#             renaming_map = postRen.updateRenamingMap(a_name_positions, 
#                                                      position_names, 
#                                                      temp_renaming_map, 
#                                                      r_strategy)
                
        # Apply renaming map and save output for future inspection
        renamed_text = postRen.applyRenaming(ib1, 
                                             a_name_positions, 
                                             temp_renaming_map)
        
         
        

        a_lexer = WebLexer(renamed_text)
        '''
        
        a_iBuilder = IndexBuilder(lexedRenamed.tokenList)
        p1 = a_iBuilder.tokens
        
        #print("(" + str(tC_ind) + ") Post Processed Text ---------------------------------------------------")
        p1_combined = reduce(lambda x,y: x+y, p1)
        #print(p1_combined)
        #print("(" + str(tC_ind) + ") Post Processed Text ---------------------------------------------------")
        #Without re-running the beautifer for spacing, this is missing whitespace.

        #print("(" + str(tC_ind) + ") Original Lexed Text ---------------------------------------------------")
        #print(self.obsLexed[tC_ind].tokenList)
        #print("(" + str(tC_ind) + ") Original Lexed Text ---------------------------------------------------")
        #1) + 5)
        i = 0
        for token_type, token in lexedObs.tokenList:
            if(token_type == Token.Text or is_token_subtype(token_type, Token.Comment)):
                continue
            if(is_token_subtype(token_type, Token.Name)):
                i += 1
                continue
            #print(str(p1_combined[i]) + " =?= " + str((token_type, token)))
            self.assertTrue(p1_combined[i] == (token_type, token))
            #try:
            #    print(str(p1_combined[i]) + " =?= " + str((token_type, token)))
            #    self.assertTrue(p1_combined[i] == (token_type, token))
            #except:
            #    print("Past end: " + str((token_type, token)))
            i += 1
            
        #3) + 4)
        #Weird note: the scope analyst does not find scopes correctly on the post-processed file...
        #Data structures needed:
        #Map from original variables to new variables
        #In old variables.  
        #1) All instances of a variable in a scope.
        #2) All variables in a scope.
        
        #Build mapping from old to new names. (TODO remove some maybe?)
        oldNameList = []
        newNameList = []
        i = 0
        for token_type, token in lexedObs.tokenList:
            if(token_type == Token.Text or is_token_subtype(token_type, Token.Comment)):
                continue
            if(is_token_subtype(token_type, Token.Name)):
                oldNameList.append(token)
                newNameList.append(p1_combined[i][1])
                
            i += 1
        
        #name2defScope? name2useScope? name2pth?
        orderedVars = sorted(sa1.name2useScope.keys(), key = lambda x: x[1])
        #undefined is a weird case -> try ignoring it?
        orderedVars = [v for v in orderedVars if v[0] != "undefined"]
        #print(lexedObs.tokenList)
        #print("Scoped Variables")
        #print(orderedVars)
        #print(oldNameList)
        #Remove variable indexes from old and new list that aren't tracked by scoper. (Is this right?)
        toRemove = []
        trackingIndex = 0
        for (var, loc) in orderedVars:
            
            #print(var)
            while(oldNameList[trackingIndex] != var):
                oldNameList = oldNameList[:trackingIndex] + oldNameList[trackingIndex+1:]
                newNameList = newNameList[:trackingIndex] + newNameList[trackingIndex+1:]
            trackingIndex += 1
            
        
        
        scopeMap = {}
        #Build map linking scopes to indexes in the old and new list.
        curIndex = 0
        for key in orderedVars:
            scope = sa1.name2useScope[key]
            if(scope in scopeMap): #Existing Scope?
                scopeMap[scope].append(curIndex)
            else:
                scopeMap[scope] = [curIndex]
            curIndex += 1
                
        #print("(" + str(tC_ind) + ") OldName ---------------------- New Name")
        #for j in range(0,len(oldNameList)):
        #    print(oldNameList[j] + " ----- " + newNameList[j])
        #print("(" + str(tC_ind) + ") OldName ---------------------- New Name")
        
        for scope in scopeMap.keys():
            #print("Scope:    " + str(scope) + "    " + str(scopeMap[scope]))
            if(len(scopeMap[scope]) > 1): #No conflicts if only one var in scope
                #Iterate over all pairs in the scope.
                for i in range(0,len(scopeMap[scope])-1):
                    for j in range(i+1, len(scopeMap[scope])):
                        fIndex = scopeMap[scope][i]
                        sIndex = scopeMap[scope][j]
                        print("Pair : " + oldNameList[fIndex] + ","  + oldNameList[sIndex] + " --> " + newNameList[fIndex] +  "," +  newNameList[sIndex])
                        #names that are the same in the original scope must be the same in the new scope
                        #and names that are different in the original scope must be the different in the new scope
                        self.assertTrue((oldNameList[fIndex] == oldNameList[sIndex]) == (newNameList[fIndex] == newNameList[sIndex]))

    
    
    def testPostprocessing(self):
        '''
        Test that the post-processing functions work correctly.
        What to look for in the tests?
        1) All non identifiers unchanged.
        2) No identifiers remain as hashes - either a translation or the original one.
        3) Consistency of same variable name in the same scope.
        4) Different variables in the same scope have different names.
        5) Output same number of tokens as the input.
        '''
        failedCases = []
        #Iterate over all renamings and obsfuscated texts
        for fileid in range(0, len(self.clearTextFiles)):
            clearTextFile = self.clearTextFiles[fileid]
            baseId =self.getFileId(clearTextFile)
            obfuscatedFile = self.obfuscatedTextFiles[fileid]
            #if(baseId != 1072219):
            #    continue
            #if(fileid > 150):
            #    break 
            for key in self.renamedFilenameMap.keys():
                print(str(baseId) + "(" + key + ")")
                #try:
                renamedFile = self.renamedFilenameMap[key][fileid]
                #Make sure we're comparing the right files.
               
                self.assertTrue(baseId == self.getFileId(obfuscatedFile) and baseId == self.getFileId(renamedFile))
                # except KeyError: #There's a slight mismatch with not all renamings existing for a file -> so we'll skip these I guess.
                #      failedCases.append(str(baseId) + "\n") # Just mark all of them as potentially wrong.
                #     break
                # except:
                #     print("Assert fail\n")
                #     print(str(baseId) + " : " + str(self.getFileId(obfuscatedFile)) + " : " + str(self.getFileId(renamedFile)))
                #if True:
                try:
                    self.compareFiles(clearTextFile, obfuscatedFile, renamedFile)
                    print("\n")
                except AssertionError:
                    print(" - Failed\n")
                    failedCases.append(str(baseId) + "(" + key + ")(Inconsistent)\n")
                except IndexError:
                    print(" - Other Failure\n")
                    failedCases.append(str(baseId) + "(" + key + ")(Other Failure)\n")
                    
        with open("consistencyFailures2.txt", 'w') as f:
            for failed in failedCases:
                f.write(failed)


if __name__=="__main__":
    unittest.main()
