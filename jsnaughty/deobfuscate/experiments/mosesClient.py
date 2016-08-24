'''
Created on Aug 21, 2016

@author: caseycas
'''
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
import xmlrpclib
from tools import Preprocessor, WebPreprocessor, Postprocessor, Beautifier, Lexer, WebLexer, IndexBuilder, ScopeAnalyst, LMQuery
from renamingStrategies import renameUsingHashDefLine
from postprocessUtil import cleanup, processTranslationScoped, processTranslationUnscoped


class MosesClient():
    
    def deobfuscateJS(self, obfuscatedCode, transactionID):
        proxy = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:8080/RPC2")
        
        mosesParams = {}
        candidates = []
        baseDir = os.getcwd()
        tempFile = baseDir + str(transactionID) + "_temp.js"
        #lm_path = "/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm"
        
        preproFile = baseDir + str(transactionID) + "_prepro.js"
        beautFile = baseDir + str(transactionID) + "_beaut.js"
        
        # Strip comments, replace literals, etc
        try:
            prepro = WebPreprocessor(obfuscatedCode)
            #TODO replace with: prepro = WebPreprocessor(text)
            prepro.write_temp_file(preproFile)
        except:
            cleanup([preproFile])
            print("Preprocessor failed")
            return("Preprocessor Failed")
            
        clear = Beautifier()
        #TODO: Need a text version of beautifier to avoid the file read and write.
        #(ok, beautText, err) = clear.webRun(preproText)
        ok = clear.run(preproFile, beautFile)
        print(ok)
        if(not ok):
            cleanup([preproFile, beautFile])
            return("Beautifier Failed")
            #quit()
        
        try:
            lex_ugly = Lexer(beautFile)
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
            cleanup([preproFile, beautFile])
            print("IndexBuilder fail")
            return("IndexBuilder Failed")
            
        lex_ugly.write_temp_file(tempFile)
        
        
        #Do Scope related tasks
        #a raw text version
        try:
            scopeAnalyst = ScopeAnalyst(tempFile)
        except:
            cleanup({"temp" : tempFile})
            print("ScopeAnalyst Fail")
            return("ScopeAnalyst Failed")
        
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
        
        results = proxy.translate(mosesParams)# __request("translate", mosesParams)
        rawText = Postprocessor(results["nbest"])
        translation = rawText.getProcessedOutput()
        
        #Send to output:
        cleanup([preproFile, beautFile, tempFile])
        return(translation)
        
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
    
