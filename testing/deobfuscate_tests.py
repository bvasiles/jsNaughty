import unittest
import sys
import os
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


class defobfuscate_tests(unittest.TestCase):
    

    
    def setUp(self):
        '''
        Don't run Moses server here (just incremental tests)
        - Take all the .orig test files and create the IndexBuilders and ScopeAnalysts here
        '''
        self.testDir = Folder("./testing/test_files/")
        self.clearTextFiles = self.testDir.baseFileNames("*.orig.js")
        self.obsfuscatedTextFiles = self.testDir.baseFileNames("*.obs.js")
        self.postTextFiles = self.testDir.baseFileNames("*.post_input.js")
        self.clearTextFiles = [os.path.join(self.testDir.path, file) for file in self.clearTextFiles]
        self.obsfuscatedTextFiles = [os.path.join(self.testDir.path, file) for file in self.obsfuscatedTextFiles]
        self.postTextFiles = [os.path.join(self.testDir.path, file) for file in self.postTextFiles]
        #print(self.testDir.path)
        #print(self.clearTextFiles)
        self.clearLexed = [Lexer(file) for file in self.clearTextFiles]
        self.obsLexed = [Lexer(file) for file in self.obsfuscatedTextFiles]
        self.postText = ["".join(open(file, "r").readlines()) for file in self.postTextFiles]
        #print(self.postText[0])
        #print(self.clearLexed)        
        
        
        
    def testIndexBuilder(self):
        '''
        Check that the index builder has correct values for the test files.
        '''
        ib1 = IndexBuilder(self.clearLexed[0].tokenList)
        '''
        # - map from (line,col) position to name
        self.charPosition2Name = {}
        # - map from name to list of (line,col) positions
        self.name2CharPositions = {}
        # - map from (line,col) position to flat position
        self.flatMap = {}
        # - map from flat position to (line,col)
        self.revFlatMat = {}
        # - map from (token_line, token_column) position in the 
        # bidimensional list of tokens to (line,col) text position
        self.tokMap = {}
        # - map from (line,col) position to (token_line, token_column)
        # position in the bidimensional list of tokens
        self.revTokMap = {}
        '''
        #print([item[1] for item in self.clearLexed[0].tokenList])
        #print(ib1)
        #print(len(ib1.charPosition2Name) == 53)
        #for i in range(0,22):
        #    linecount = 0
        #    for j in range(0, 110):
        #        if((i,j) in ib1.charPosition2Name):
        #            linecount += 1
        #    print("Line " + str(i+1) + " has " + str(linecount) + " variables.")
        
        #Test charPosition2Name
        self.assertTrue(len(ib1.charPosition2Name) == 53)
        self.assertTrue(ib1.charPosition2Name[(0,4)] == u'geom2d')
        self.assertTrue(ib1.charPosition2Name[(2,8)] ==u'a')
        self.assertTrue(ib1.charPosition2Name[(15,13)] == u'mix')
        self.assertTrue(ib1.charPosition2Name[(16,17)] == u'k')
        
        #Test name2charPositions
        self.assertTrue(len(ib1.name2CharPositions) == 16)
        self.assertTrue(sum([len(value) for key,value in ib1.name2CharPositions.iteritems()]) == 53)
        self.assertTrue(len(ib1.name2CharPositions[u'x']) == 7)
        self.assertTrue(len(ib1.name2CharPositions[u'Vector2d']) == 4)
        
        #Test flatMap
        self.assertTrue(ib1.flatMap[(1, 8)] == 34)
        self.assertTrue(ib1.flatMap[(3, 22)] ==  128)
        
        #Test revFlatMap
        #Typo Bug: revFlatMat or revFlatMap?
        self.assertTrue(len(ib1.flatMap) == len(ib1.revFlatMat))
        for key, value in ib1.flatMap.iteritems():
            self.assertTrue(ib1.revFlatMat[value] == key)
            
        #Test tokMap and revTokMap
        #These are supposed to be different? Yes, includes maps to whitespace. (so leading whitespace also maps to identifiers)
        print(len(ib1.tokMap))
        print(len(ib1.revTokMap))
        #self.assertTrue(len(ib1.tokMap) == len(ib1.revTokMap))
        #i = 0
        for key, value in ib1.tokMap.iteritems():
            if(value in ib1.revTokMap.keys()):
                self.assertTrue(ib1.revTokMap[value] == key)
            #print("RevTokMap " + str(key) + " : " + str(value))
            #print("TokMap " + str(value) + " : " + str(ib1.tokMap[value]))
            #if(ib1.tokMap[value] != key):
            #    i += 1
            #    print("Error Case!!!")
            #self.assertTrue(ib1.tokMap[value] == key)
        
        #print("Error Cases " + str(i))
            
        
        
        
    
    def testScopeAnalyst(self):
        '''
        TODO: Check that the scope analyst works properly
        '''
        #__main__.py in tools is a useful tool for examining these.
        #print(self.obsfuscatedTextFiles[0])
        #This doesn't work when run inside pyDev for some weird reason.
        sa1 = ScopeAnalyst(self.obsfuscatedTextFiles[0])
        print(sa1)
        #Not really sure how to test this effectively.
        
        #Check (using minified file) if identifier name maps to different variables if
        #they are in different scopes.  Can look at __main__.py
        #Variables: geom2d,t,i,r,x,y,n,e,o,u
        #Why do x and y not appear in the variables? (Is it b/c they are not defined anywhere in this snippet?)
        self.assertTrue(len(sa1.nameScopes[(u'geom2d')]) == 1)
        self.assertTrue(len(sa1.nameScopes[(u'numeric')]) == 1)
        self.assertTrue(len(sa1.nameScopes[(u't')]) == 3)
        self.assertTrue(len(sa1.nameScopes[(u'i')]) == 1)
        self.assertTrue(len(sa1.nameScopes[(u'r')]) == 4)
        self.assertTrue(len(sa1.nameScopes[(u'n')]) == 4)
        #self.assertTrue(len(sa1.nameScopes[(u'x')]) == 2)
        #self.assertTrue(len(sa1.nameScopes[(u'y')]) == 2)
        self.assertTrue(len(sa1.nameScopes[(u'u')]) == 1)
        self.assertTrue(len(sa1.nameScopes[(u'e')]) == 1)
        self.assertTrue(len(sa1.nameScopes[(u'o')]) == 1)
                        
                        
        #isGlobal:
        #print("IsGlobal-----------------------------------------------")
        #print(sa1.isGlobal)
        #print("IsGlobal-----------------------------------------------")
        self.assertTrue(sa1.isGlobal[(u'geom2d', 4)] == True)
        self.assertTrue(sa1.isGlobal[(u'i', 85)] ==  False)
        self.assertTrue(True)
        
        
        
        
    def testHashDefRenaming(self):
        '''
        TODO: Test the hashing functions are using the context correctly for both one and two line
        options.  Goals are to confirm a) correct line summarization b) consistency of naming
        of the same variable.  However, two different variables may map to the same name with
        insufficient context.
        '''
        #print(self.obsfuscatedTextFiles[0])
        ib1 = IndexBuilder(self.obsLexed[0].tokenList)
        sa1 = ScopeAnalyst(self.obsfuscatedTextFiles[0])
        
        RS = RenamingStrategies()
        preRen = PreRenamer()
        oneLine1 = preRen.rename(RS.HASH_ONE, ib1, sa1, True)
        twoLine1 = preRen.rename(RS.HASH_TWO, ib1, sa1, True)
        
#         oneLine1 = renameUsingHashDefLine(sa1, ib1, False, True)
#         twoLine1 = renameUsingHashDefLine(sa1, ib1, True, True)
        
        print("OneLine1------------------------------------------------")
        print(oneLine1)
        print("TwoLine1------------------------------------------------")
        print(twoLine1)
        
        #One line tests
        lines = oneLine1.split("\n")
        self.assertTrue(lines[0] == "var geom2d = function ( ) {")
        #var <<var#=numeric.sum,=numeric.numberEquals;>> = numeric . sum , <<var=numeric.sum,#=numeric.numberEquals;>> = numeric . numberEquals ;
        self.assertTrue(lines[1] == "var <<var#=numeric.sum,=numeric.numberEquals;>> = numeric . sum , <<var=numeric.sum,#=numeric.numberEquals;>> = numeric . numberEquals ;")
        self.assertTrue(lines[3] == "function <<function#(,){>> ( <<function(#,){>> , <<function(,#){>> ) {")
        self.assertTrue(lines[4] == "this . x = <<function(#,){>> ;") #Why is x not transformed? Global, can't change...
        self.assertTrue(lines[7] == "u ( <<function#(,){>> , {") #Why is u not transformed? -> Because u's hash <<function#(,){>> is ALREADY IN USE IN THE SAME SCOPE!!  (This is why u can be translated in 2-lines)
        self.assertTrue(lines[16] == "for ( var <<for(var#in)[]=[];>> in <<function(,#){>> ) <<function(#,){>> [ <<for(var#in)[]=[];>> ] = <<function(,#){>> [ <<for(var#in)[]=[];>> ] ;")
        self.assertTrue(lines[20] == "Vector2d : <<function#(,){>>")
        #Two line tests (TODO)
        lines = twoLine1.split("\n")
        self.assertTrue(lines[0] == "var geom2d = function ( ) {")
      
        self.assertTrue(lines[1] == "var <<var#=numeric.sum,=numeric.numberEquals;return#([this.x*.x,this.y*.y]);>> = numeric . sum , <<var=numeric.sum,#=numeric.numberEquals;return#(this.x,.x,)&&(this.y,.y,);>> = numeric . numberEquals ;")
        #                            function <<function#(,){(#,{>> ( <<function(#,){this.x=#;>> , <<function(,#){this.y=#;>> ) {
        self.assertTrue(lines[3] == "function <<function#(,){(#,{>> ( <<function(#,){this.x=#;>> , <<function(,#){this.y=#;>> ) {")
        self.assertTrue(lines[4] == "this . x = <<function(#,){this.x=#;>> ;") #Why is x not transformed? Global, can't change...
      
        #u(r, {
        #                            #<<function#(,){#(,{>> ( <<function#(,){(#,{>> , {
        self.assertTrue(lines[7] == "<<function#(,){#(,{>> ( <<function#(,){(#,{>> , {")# is transformed, but order seems backwards.
        self.assertTrue(lines[16] == "for ( var <<for(var#in)[]=[];for(varin)[#]=[];>> in <<function(,#){for(varin#)[]=[];>> ) <<function(#,){for(varin)#[]=[];>> [ <<for(var#in)[]=[];for(varin)[#]=[];>> ] = <<function(,#){for(varin#)[]=[];>> [ <<for(var#in)[]=[];for(varin)[#]=[];>> ] ;") #Not really two lines, but two references?
        self.assertTrue(lines[20] == "Vector2d : <<function#(,){(#,{>>")
        
        self.assertTrue(True)
    
    
    
    
    def testPostprocessing(self):
        '''
        TODO: Test that the post-processing functions work correctly.
        This will build off of existing Moses output (run separately from these tests)
        Example call:
        processed_translation = processTranslationScopedServer(translation, 
                                                              iBuilder_ugly, 
                                                              scopeAnalyst, 
                                                              lm_path)
        What to look for in the tests?
        1) All non identifiers unchanged.
        2) No identifiers remain as hashes - either a translation or the original one.
        3) Consistency of same variable name in the same scope.
        4) Different variables in the same scope have different names.
        5) Output same number of tokens as the input.
        '''
        lm_path = ""
        ib1 = IndexBuilder(self.obsLexed[0].tokenList)
        sa1 = ScopeAnalyst(self.obsfuscatedTextFiles[0])
        
        (a_name_positions, 
             a_position_names) = prepHelpers(ib1, sa1)
        
        translation = self.postText[0]

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
        ts = TranslationSummarizer()
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
        p1 = postRen.applyRenaming(ib1, 
                                                 a_name_positions, 
                                                 temp_renaming_map)
        
#         p1 = processTranslationScopedServer(self.postText[0], ib1, sa1, lm_path)
        print("Post Processed Text ---------------------------------------------------")
        p1_combined = reduce(lambda x,y: x+y, p1)
        print(p1_combined)
        print("Post Processed Text ---------------------------------------------------")
        #Without re-running the beautifer for spacing, this is missing whitespace.
        print("Original Lexed Text ---------------------------------------------------")
        print(self.obsLexed[0].tokenList)
        print("Original Lexed Text ---------------------------------------------------")
        #1) + 5)
        i = 0
        for token_type, token in self.obsLexed[0].tokenList:
            if(token_type == Token.Text or is_token_subtype(token_type, Token.Comment)):
                continue
            if(is_token_subtype(token_type, Token.Name)):
                i += 1
                continue
            print(str(p1_combined[i]) + " =?= " + str((token_type, token)))
            self.assertTrue(p1_combined[i] == (token_type, token))
            #try:
            #    print(str(p1_combined[i]) + " =?= " + str((token_type, token)))
            #    self.assertTrue(p1_combined[i] == (token_type, token))
            #except:
            #    print("Past end: " + str((token_type, token)))
            i += 1
        #2)
        for token_type, token in p1_combined:
            self.assertTrue("<<" not in token)
            
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
        for token_type, token in self.obsLexed[0].tokenList:
            if(token_type == Token.Text or is_token_subtype(token_type, Token.Comment)):
                continue
            if(is_token_subtype(token_type, Token.Name)):
                oldNameList.append(token)
                newNameList.append(p1_combined[i][1])
                
            i += 1
        
        #name2defScope? name2useScope? name2pth?
        orderedVars = sorted(sa1.name2useScope.keys(), key = lambda x: x[1])
        print("Scoped Variables")
        print(orderedVars)
        #Remove variable indexes from old and new list that aren't tracked by scoper. (Is this right?)
        toRemove = []
        trackingIndex = 0
        for (var, loc) in orderedVars:
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
                
        print("OldName ---------------------- New Name")
        for j in range(0,len(oldNameList)):
            print(oldNameList[j] + " ----- " + newNameList[j])
        print("OldName ---------------------- New Name")
        
        for scope in scopeMap.keys():
            print("Scope:    " + str(scope) + "    " + str(scopeMap[scope]))
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
                

            
        #writeTmpLines(p1, os.path.join(self.testDir.path, "consistency_check.txt"))
        #clear = Beautifier()
        #clear.run(os.path.join(self.testDir.path, "consistency_check.txt"), os.path.join(self.testDir.path, "b_consistency_check.txt"))
        #sap1 = ScopeAnalyst( os.path.join(self.testDir.path, "b_consistency_check.txt"))
        #print("Post Process SA ------------------------------------------------")
        #print(sap1)
        #print("Post Process SA ------------------------------------------------")
        

        
        #lm_path = ...
        #Read in moses output
        
        #call postprocess function.
        
        self.assertTrue(True)
    


if __name__=="__main__":
    unittest.main()