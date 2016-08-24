'''
Created on Aug 20, 2016

@author: caseycas
'''

import xmlrpclib
from tools import Preprocessor
from tools.postprocessor import Postprocessor

proxy = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:8080/RPC2")

mosesParams = {}

input_path = "/Users/caseycas/jsnaughty/data/js_files.sample/98440.js"

# Strip comments, replace literals, etc
try:
    prepro = Preprocessor(input_path)
    #prepro.write_temp_file(output_path)
except:
    print("Preprocessor failed")
    quit()
    
#print(prepro.__str__())
#quit()

#mosesParams["text"] = "var m = [ ]"
mosesParams["text"] = prepro.__str__()
mosesParams["align"] = "true"
mosesParams["report-all-factors"] = "true"


results = proxy.translate(mosesParams)# __request("translate", mosesParams)
translation = Postprocessor(results["text"])
print(translation.getProcessedOutput())

#Fixes -> need to remove UNKs
#need to add <line num> ||| parsed output

#Java version
#HashMap<String,String> mosesParams = new HashMap<String,String>();
#            String textToTranslate = new String("var m = [ ]");
#            mosesParams.put("text", textToTranslate);
#            mosesParams.put("align", "true");
#            mosesParams.put("report-all-factors", "true");
#            // The XmlRpcClient.execute method doesn't accept Hashmap (pParams). It's either Object[] or List. 
#            Object[] params = new Object[] { null };
#            params[0] = mosesParams;
#            // Invoke the remote method "translate". The result is an Object, convert it to a HashMap.
#            HashMap<String,Object> result = (HashMap<String,Object>)client.execute("translate", params);
           
