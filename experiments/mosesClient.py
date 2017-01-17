'''
Created on Aug 21, 2016

@author: caseycas
'''
import os
import sys
import time
import socket
# import multiprocessing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
# import xmlrpclib
# from tools import Preprocessor, WebPreprocessor, Postprocessor, Beautifier, Lexer, WebLexer, IndexBuilder, ScopeAnalyst, LMQuery
# from renamingStrategies import renameUsingHashDefLine, Strategies, renameUsingScopeId, renameUsingHashAllPrec
# from postprocessUtil import cleanup, processTranslationScoped, processTranslationUnscoped, processTranslationScopedServer

from tools import IndexBuilder, Beautifier, prepHelpers, WebMosesDecoder, \
                    WebScopeAnalyst, WebLMPreprocessor, WebLexer, \
                    MosesParser, ConsistencyResolver, PreRenamer, \
                    PostRenamer, RenamingStrategies, ConsistencyStrategies, \
                    MosesProxy


prepro_error = "Preprocessor Failed"
beaut_error = "Beautifier Failed"
ib_error = "IndexBuilder Failed"
sa_error = "ScopeAnalyst Failed"
ms_error = "Moses Server Step Failed"
rn_error = "Renaming Failed"


# def init():
#     global server1
#     global server2
#     server1 = xmlrpclib.ServerProxy('http://godeep.cs.ucdavis.edu:40012/RPC2',)
#     server2 = xmlrpclib.ServerProxy('http://godeep.cs.ucdavis.edu:40013/RPC2',)

# def callMosesWrapper(tuple):
#     '''
#     Work-around for multiprocessing issues in python 2.
#     Due to how multiprocess works, this can't be in a class without 
#     a lot of additional tweaking.
#     '''
#     return callMoses(tuple[0], tuple[1])
    
# def convertToParams(line):
#     '''
#     Convert a string into the moses param object.
#     '''
#     newParams = {}
#     newParams["text"] = line
#     newParams["align"] = "true"
#     newParams["report-all-factors"] = "true"
#     return newParams


# def callMosesAlt(mosesParams):
#     pid = int(multiprocessing.current_process().ident)
#     if(pid%2 == 0):
#         results = server1.translate(mosesParams)
#     else:
#         results = server2.translate(mosesParams)
#     rawText = Postprocessor(results["nbest"])
#     translation = rawText.getProcessedOutput()
#     return translation

# def callMoses(mosesParams, proxy):
#     results = proxy.translate(mosesParams)# __request("translate", mosesParams)
#     rawText = Postprocessor(results["nbest"])
#     translation = rawText.getProcessedOutput()
#     return translation

# def callRenamingFunction(type, scopeAnalyst, iBuilder_ugly, options):
#     '''
#     Select the renaming function to use in the preprocessing.  Options specifies
#     the additional options if applicable.  If no options are provided and the function
#     uses additional ones, some defaults are selected.
#     '''
#     #renameUsingScopeId (no options)
#     #renameUsingHashAllPrec (debug option)
#     #renameUsingHashDefLine (debug and two_lines option)
#     if(type == Strategies.SCOPE_ID):
#         return renameUsingScopeId(scopeAnalyst, iBuilder_ugly)
#     elif(type == Strategies.HASH_ALL_PREC):
#         if("debug" not in options):
#             options["debug"] = False
#         return renameUsingHashAllPrec(scopeAnalyst, iBuilder_ugly, options["debug"])
#     else: #Hash Def Line is default strategy
#         if("two_lines" not in options):
#             options["twoLines"] = False
#         if("debug" not in options):
#             options["debug"] = False
#         return renameUsingHashDefLine(scopeAnalyst, iBuilder_ugly, options["twoLines"], options["debug"])


# def writeTmpLines(lines, 
#                   out_file_path):
#     
#     js_tmp = open(out_file_path, 'w')
#     js_tmp.write('\n'.join([' '.join([token for (_token_type, token) in line]) 
#                             for line in lines]).encode('utf8'))
#     js_tmp.write('\n')
#     js_tmp.close()

#2
class MosesClient():
    
    def getValidationErrors(self):
        return [prepro_error,beaut_error,ib_error,sa_error]
    
    def getServerError(self):
        return ms_error
    
    
    def splitTexts(self, text, proxies):
        '''
        Given the texts, map each to a proxy, spliting on the number
        '''
        splitMap = {}
        _proxyCount = len(proxies)
        i = 0
        for l in text.split("\n"):
            print(l)
            if(i in splitMap):
                params = splitMap[i]
                params[1]["text"] += l + "\n"
                splitMap[i] = params
            else:
                newParams = (proxies[i], {})
                newParams[1]["text"] = l + "\n"
                newParams[1]["align"] = "true"
                newParams[1]["report-all-factors"] = "true"
                splitMap[i] = newParams
            i += 1
            if(i >= len(proxies)):
                i = 0
                
        return splitMap
                    
            

    
    #TODO: Double check what cleanup does..
    def deobfuscateJS(self, obfuscatedCode, transactionID):
        
        RS = RenamingStrategies()
        CS = ConsistencyStrategies()
        
        r_strategy = RS.HASH_ONE
        #c_strategy = CS.FREQLEN # or CS.LM? (CS.LM requires a language model + a querylm from moses)
        c_strategy = CS.LM
        
        proxy = MosesProxy().proxies[r_strategy]
        
#         proxy = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40012/RPC2")
#         proxy2 = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40013/RPC2")
#         proxies = [proxy, proxy2]
        
        
        mosesParams = {}
#         candidates = []
#         baseDir = os.getcwd()
#         base_name = "webTemp" + str(transactionID)
#         tempFile = baseDir + str(transactionID) + "_temp.js"
        lm_path = "/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm"
        #lm_path = "/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.500k/js.blm.lm"        
        if socket.gethostname() == 'bogdan.mac':
            lm_path = "/Users/bogdanv/workspace2/deobfuscator/data/lm/js.blm.lm"
        elif socket.gethostname() == "Caseys-MacBook-Pro.local" or socket.gethostname() == "campus-019-136.ucdavis.edu":
            lm_path = "/Users/caseycas/jsnaughty_lms/js970k.blm.lm"
            
#         preproFile = baseDir + str(transactionID) + "_prepro.js"
#         beautFile = baseDir + str(transactionID) + "_beaut.js"
#         tmpFile = baseDir + str(transactionID) + "_tmp.js"
#         transFile = baseDir + str(transactionID) + "_trans.js"
        
        start = time.time()
        # Strip comments, replace literals, etc
        try:
            prepro = WebLMPreprocessor(obfuscatedCode)
            prepro_text = str(prepro)
            #TODO replace with: prepro = WebPreprocessor(text)
#             prepro.write_temp_file(preproFile)
        except:
#             cleanup([preproFile])
            print(prepro_error)
            return(prepro_error)
            
        clear = Beautifier()
        #TODO: Need a text version of beautifier to avoid the file read and write.
        #(ok, beautText, err) = clear.webRun(preproText)
        (ok, beautified_text, _err) = clear.web_run(prepro_text)
#         ok = clear.run(preproFile, beautFile)

        if(not ok):
#             cleanup([preproFile, beautFile])
            print(beaut_error)
            return(beaut_error)
        
        try:
#             lex_ugly = Lexer(beautFile)
            lex_ugly = WebLexer(beautified_text)
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
#             cleanup([preproFile, beautFile])
            print(ib_error)
            return(ib_error)
            
        #lex_ugly.write_temp_file(tempFile)
        
        
        #Do Scope related tasks
        #a raw text version
        try:
#             scopeAnalyst = ScopeAnalyst(beautFile)
            scopeAnalyst = WebScopeAnalyst(beautified_text)
        except:
#             cleanup({"temp" : tempFile})
            print(sa_error)
            return(sa_error)
        
        (_name_positions, \
         position_names) = prepHelpers(iBuilder_ugly, scopeAnalyst)

        #Do Rename related tasks
        #Nov_29 Update:
        #Needs to be written in a generic way
        #What are the inputs and outputs that need to be captured so we can plug in any renaming function
        #Input: scope analyst, iBuilder (text is contained w/in IBuilder), twoLines = T/F (how many lines of context), debug =T/F (convert the last two and potentially others in an options argument)
        #Output: hashed snippet
        
#         options = {}
#         options["twoLines"] = False
#         options["debug"] = False
#         renamedText = callRenamingFunction(Strategies.HASH_DEF_LINE, scopeAnalyst, iBuilder_ugly, options)
        rn_start = time.time()
        
        try:
#         if True:
            # Rename input prior to translation
            preRen = PreRenamer()
            after_text = preRen.rename(r_strategy, 
                                      iBuilder_ugly,
                                      scopeAnalyst)
            
            (ok, renamedText, _err) = clear.web_run(after_text)
            if not ok:
                print(beaut_error)
                return(beaut_error)
            
#             # Save renamed input to disk for future inspection
#             with open(temp_files['%s' % (r_strategy)], 'w') as f:
#                 f.write(renamedText)
            
            a_lexer = WebLexer(renamedText)
            a_iBuilder = IndexBuilder(a_lexer.tokenList)
            a_scopeAnalyst = WebScopeAnalyst(renamedText)
            
        except:
            print(rn_error)
            return(rn_error)

#         with open("renameFile.txt", 'w') as renamingFile:
#             renamingFile.writelines(renamedText)
 
        end = time.time()
        rnTime = end-rn_start
        preprocessDuration = end - start
        
        m_start = time.time()
        
        #In our case, I don't think we need to actually do anything for no_renaming
        #no_renaming = []
        #for _line_idx, line in enumerate(iBuilder_ugly.tokens):
        #    no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        #Hash_def_one_renaming
        #beautText = renameUsingHashDefLine(scopeAnalyst, 
        #                                               iBuilder_ugly, 
        #                                               twoLines=False,
        #                                                debug=False)

        # here you split the input into ten
        # let input be the list of parts (iterator)
        #print(lex_ugly.collapsedText)
        #proxyMap = self.splitTexts(lex_ugly.collapsedText, proxies)
        translation = ""

        mosesParams["text"] = renamedText
        #mosesParams["text"] = lex_ugly.collapsedText
        mosesParams["align"] = "true"
        mosesParams["report-all-factors"] = "true"

        md = WebMosesDecoder(proxy)
            
        lx = WebLexer(a_iBuilder.get_text())
        
        try:
            # Translate renamed input
            (ok, translation, _err) = md.run(lx.collapsedText)
#             results = proxy.translate(mosesParams)# __request("translate", mosesParams)
#             print(results)
#             rawText = Postprocessor(results["nbest"])
#             translation = rawText.getProcessedOutput()
        except:
#             cleanup([preproFile, beautFile, tempFile])
            print(ms_error)
            return(ms_error)
        
        #Send to output:
        #cleanup([preproFile, beautFile, tempFile])
        
        m_end = time.time()
        m_time = m_end - m_start
        #Nov_29 Postprocessing steps:
        #processTranslationScoped
        #Inputs: raw Moses Output text, IBuilder, scopeAnalyst, language model path -> If moses gives back a list of n best options we could
        #use Moses' top choice, or apply the lm a second time (Moses does this FOR EACH LINE).  Want to find best consistent combination of lines
        #using each of the possible renamings of a variable.
        #More Inputs: the text input into Moses (used to compare to the output after renaming), output_path -> where to save the file, base_name -> used to look up temp files.
        
        #Base_name is a problem to removing the temp files... (It references bogdan's original naming scheme)
        post_start = time.time()

        (a_name_positions, 
             a_position_names) = prepHelpers(a_iBuilder, a_scopeAnalyst)
        
        if translation is not None:
            # Parse moses output
            mp = MosesParser()
            print(translation)
                
            name_candidates = mp.parse(translation,
                                       a_iBuilder,
                                       a_position_names,
                                       a_scopeAnalyst)
            # name_candidates is a dictionary of dictionaries: 
            # keys are (name, None) (if scopeAnalyst=None) or 
            # (name, def_scope) tuples (otherwise); 
            # values are suggested translations with the sets 
            # of line numbers on which they appear.
            
                
            cr = ConsistencyResolver()
#             ts = TranslationSummarizer()
                
            # An identifier may have been translated inconsistently
            # across different lines (Moses treats each line independently).
            # Try different strategies to resolve inconsistencies, if any
            
            # Compute renaming map (x -> length, y -> width, ...)
            # Note that x,y here are names after renaming
            temp_renaming_map = cr.computeRenaming(c_strategy,
                                              name_candidates,
                                              a_name_positions,
                                              a_iBuilder,
                                              lm_path)
            
            # Fall back on original names in input, if 
            # no translation was suggested
            postRen = PostRenamer()
            renaming_map = postRen.updateRenamingMap(a_name_positions, 
                                                     position_names, 
                                                     temp_renaming_map, 
                                                     r_strategy)
            
            # Apply renaming map and save output for future inspection
            renamed_text = postRen.applyRenaming(a_iBuilder, 
                                                 a_name_positions, 
                                                 renaming_map)
            (ok, postProcessedText, _err) = clear.web_run(renamed_text)
            if not ok:
                print(beaut_error)
                return(beaut_error)
            
            
#         nc = processTranslationScoped(translation, 
#                                       iBuilder_ugly, 
#                                       scopeAnalyst, 
#                                       lm_path, 
#                                       "renameFile.txt", 
#                                       baseDir + "/jsnaughty_output", 
#                                       base_name)
        
#         processed_translation = processTranslationScopedServer(translation, 
#                                                               iBuilder_ugly, 
#                                                               scopeAnalyst, 
#                                                               lm_path)
#         
#         writeTmpLines(processed_translation, tmpFile)
#         
#         ok = clear.run(tmpFile, transFile)
# 
#         if(not ok):
#             cleanup([preproFile, beautFile, tmpFile, transFile])
#             print(beaut_error)
#             return(beaut_error)
        
#         print("Output Dir ------------------------------------------------")
#         print(baseDir + "/jsnaughty_output")
#         #print(nc)
# #         postProcessedText = open(baseDir + "/jsnaughty_output/webTemp0.txt.lm.js", 'r').readlines()
#         postProcessedText = open(transFile, 'r').readlines()
#         print(postProcessedText)
        
        post_end = time.time()
        post_time = post_end - post_start
        return("Preprocess Time: " + str(preprocessDuration)  + "\nRename Time (Subset of Preprocess): " + str(rnTime) + "\n" + "Moses Time: " + str(m_time) + "\n" + "Postprocess Time: " + str(post_time) + "\n" + "".join(postProcessedText))
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
    
