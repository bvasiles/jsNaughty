'''
Created on Aug 21, 2016

@author: caseycas
'''
import os
import sys
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
import xmlrpclib
from tools import Preprocessor, WebPreprocessor, Postprocessor, Beautifier, Lexer, WebLexer, IndexBuilder, ScopeAnalyst, LMQuery
from renamingStrategies import renameUsingHashDefLine
from postprocessUtil import cleanup, processTranslationScoped, processTranslationUnscoped


prepro_error = "Preprocessor Failed"
beaut_error = "Beautifier Failed"
ib_error = "IndexBuilder Failed"
sa_error = "ScopeAnalyst Failed"
ms_error = "Moses Server Step Failed"

class MosesClient():

    
    def getValidationErrors(self):
        return [prepro_error,beaut_error,ib_error,sa_error]
    
    def getServerError(self):
        return ms_error
    
    #TODO: Double check what cleanup does..
    def deobfuscateJS(self, obfuscatedCode, transactionID):
        proxy = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40012/RPC2")
        
        mosesParams = {}
        candidates = []
        baseDir = os.getcwd()
        tempFile = baseDir + str(transactionID) + "_temp.js"
        #lm_path = "/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm"
        
        preproFile = baseDir + str(transactionID) + "_prepro.js"
        beautFile = baseDir + str(transactionID) + "_beaut.js"
        start = time.time()
        # Strip comments, replace literals, etc
        try:
            prepro = WebPreprocessor(obfuscatedCode)
            #TODO replace with: prepro = WebPreprocessor(text)
            prepro.write_temp_file(preproFile)
        except:
            cleanup([preproFile])
            print(prepro_error)
            return(prepro_error)
            
        clear = Beautifier()
        #TODO: Need a text version of beautifier to avoid the file read and write.
        #(ok, beautText, err) = clear.webRun(preproText)
        ok = clear.run(preproFile, beautFile)
        print(ok)
        if(not ok):
            cleanup([preproFile, beautFile])
            print(beaut_error)
            return(beaut_error)
        
        try:
            lex_ugly = Lexer(beautFile)
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
            cleanup([preproFile, beautFile])
            print(ib_error)
            return(ib_error)
            
        lex_ugly.write_temp_file(tempFile)
        
        
        #Do Scope related tasks
        #a raw text version
        try:
            scopeAnalyst = ScopeAnalyst(tempFile)
        except:
            cleanup({"temp" : tempFile})
            print(sa_error)
            return(sa_error)
        
        end = time.time()
        preprocessDuration = end - start
        #Do Rename related tasks
        #In our case, I don't think we need to actually do anything for no_renaming
        #no_renaming = []
        #for _line_idx, line in enumerate(iBuilder_ugly.tokens):
        #    no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        #Hash_def_one_renaming
        #beautText = renameUsingHashDefLine(scopeAnalyst, 
        #                                               iBuilder_ugly, 
        #                                               twoLines=False,
        #                                                debug=False)
        print(lex_ugly.collapsedText)
        mosesParams["text"] = lex_ugly.collapsedText
        mosesParams["align"] = "true"
        mosesParams["report-all-factors"] = "true"
        
        try:
            results = proxy.translate(mosesParams)# __request("translate", mosesParams)
            rawText = Postprocessor(results["nbest"])
            translation = rawText.getProcessedOutput()
        except:
            cleanup([preproFile, beautFile, tempFile])
            print(ms_error)
            return(ms_error)
        
        #Send to output:
        cleanup([preproFile, beautFile, tempFile])
        return("Preprocess Time: " + str(preprocessDuration) + "\n" + translation)
        
        #Use one of the scoping options
        #None
        #nc = processTranslationUnscoped(translation, iBuilder_ugly, 
        #                                lm_path, tempFile,
        #                                tempFile + ".out", str(transactionID))
        
        #if nc:
        #    candidates += nc
        #print("Here!")
        #print("Result: " + str(nc))
        
        #If candidates is empty, display the original text?
            
        #Scope
        #nc = processTranslationScoped(translation, iBuilder_ugly, 
        #                              scopeAnalyst, lm_path, temp_files['f2'],
        #                               output_path, base_name)
        #if nc:
        #    candidates += nc
    
