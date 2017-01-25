import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
#from tools import IndexBuilder, ScopeAnalyst, Lexer
from folderManager.folder import Folder
# from experiments.mosesClient import writeTmpLines
# from experiments.postprocessUtil import processTranslationScoped, processTranslationUnscoped, processTranslationScopedServer
from experiments.evalRenamingHelper import isAbbrev,suggestionApproximateMatch


class defobfuscate_tests(unittest.TestCase):
    
    def testAbbrev(self):
        self.assertFalse(isAbbrev("",""))
        self.assertTrue(isAbbrev("src", "source"))
        self.assertTrue(isAbbrev("destination", "dest"))
        self.assertFalse(isAbbrev("ip", "zip"))
        self.assertFalse(isAbbrev("i", "indent"))

    def testApproxMatch(self):
        v1 = suggestionApproximateMatch(["tableRow","translucency1","meView"], "view")
        v2 = suggestionApproximateMatch(["msg","err","str"], "message")
        v3 = suggestionApproximateMatch(["_5e6cd6f3","$","i","c","value","type"], "canvasId")
        v4 = suggestionApproximateMatch(["_5e6cd6f3","$","i","c","canvas_id","type"], "canvasId")
        v5 = suggestionApproximateMatch(["_5e6cd6f3","$","i","c","canvas","type"], "Canvas")
        self.assertTrue(v1 == (False, False, True, False))
        self.assertTrue(v2 == (False, False, False, True))
        print(v4)
        self.assertTrue(v3 == (False, False, False, False))
        self.assertTrue(v4 == (False, True, True, True))
        self.assertTrue(v5 == (True, True, True, True))

if __name__=="__main__":
    unittest.main()
