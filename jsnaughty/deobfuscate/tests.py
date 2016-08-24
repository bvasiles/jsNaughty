from django.test import TestCase
from deobfuscate.experiments import MosesClient

# Create your tests here.

class DeobsfuscateWebTests(TestCase):
    
    def test_inner_deobsfucation(self):
        #Subject to change once we have the postprocessing fixed.
        rClient = MosesClient()
        output = rClient.deobfuscateJS("var m = []", 0)
        self.assertEqual(output.count("\n"), 9)
        topSuggestion = output.split("\n")[0].split("|||")[1].strip()
        self.assertEqual(topSuggestion, "var m = [ ] ;")
        