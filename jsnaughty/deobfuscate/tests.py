from django.test import TestCase
from deobfuscate.experiments import MosesClient
from django.urls import reverse

# Create your tests here.

class DeobsfuscateWebTests(TestCase):
    
    def test_inner_deobsfucation(self):
        #Subject to change once we have the postprocessing fixed.
        rClient = MosesClient()
        output = rClient.deobfuscateJS("var m = []", 0)
        self.assertEqual(output.count("\n"), 9)
        topSuggestion = output.split("\n")[0].split("|||")[1].strip()
        self.assertEqual(topSuggestion, "var m = [ ] ;")
    
    def test_js_get_view(self):
        '''
        Test that this view returns expected error codes and objects
        depending on system state. (Problem, we can't really test the
        internal server offline error automatically - may need to 
        guarantee its running somehow.)
        '''
        response = self.client.post("/deobfuscate/get_js/", {'in_text' : "var m = []"})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Behold, The Deobfuscated Javascript:")
        
        response = self.client.post("/deobfuscate/get_js/", {'in_text' : "var m = ()"})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '(Error) Please enter valid javascript.')
        