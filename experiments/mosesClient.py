'''
Created on Aug 21, 2016

@author: caseycas
'''
import os
import sys
from copy import deepcopy
import time
import socket
# import multiprocessing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
from unicodeManager import UnicodeReader, UnicodeWriter
from tools import Uglifier, Beautifier
from tools import UnuglifyJS
from tools import Aligner, IndexBuilder, WebLexer
from tools import PreRenamer, PostRenamer
from tools import MosesProxy, WebMosesDecoder, MosesParser
from tools import WebScopeAnalyst
from tools import prepHelpers, WebLMPreprocessor
from tools import RenamingStrategies, ConsistencyStrategies
from tools.consistency import ENTROPY_ERR
from tools.suggestionMetrics import *

from consistencyController import ConsistencyController
from renamingStrategyHelper import getMosesTranslation

from folderManager import Folder


prepro_error = "Preprocessor Failed"
beaut_error = "Beautifier Failed"
ib_error = "IndexBuilder Failed"
sa_error = "ScopeAnalyst Failed"
ms_error = "Moses Server Step Failed"
rn_error = "Renaming Failed"


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
        #c_strategy = CS.LM
        c_strategy = CS.LOGMODEL
        
        proxy = MosesProxy().proxies[r_strategy]
        
#         proxy = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40012/RPC2")
#         proxy2 = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40013/RPC2")
#         proxies = [proxy, proxy2]
        
        
        mosesParams = {}

        #lm_path = "/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm"
        lm_path = "/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.500k/js.blm.lm"        
        #if socket.gethostname() == 'bogdan.mac':
        #    lm_path = "/Users/bogdanv/workspace2/deobfuscator/data/lm/js.blm.lm"
        #elif socket.gethostname() == "Caseys-MacBook-Pro.local" or socket.gethostname() == "campus-019-136.ucdavis.edu":
        #    lm_path = "/Users/caseycas/jsnaughty_lms/js970k.blm.lm"
        
        #Hashed Name -> Minified Name (name, def_scope) -> (name, def_scope)
        hash_name_map = {}
        #Minified Name -> jsnice name  (name, def_scope) -> (name, def_scope)
        jsnice_name_map = {}
           
        transFile = baseDir + str(transactionID) + "_trans.js"
        
        start = time.time()
        # Strip comments, replace literals, etc
        #try:
        if True:
            prepro = WebLMPreprocessor(obfuscatedCode)
            prepro_text=str(prepro)
            print("Prepro_text----------------------------------")
            print(prepro_text)
            print("Prepro_text----------------------------------")

#        except:
#             cleanup([preproFile])
#            print(prepro_error)
#            return(prepro_error)
            
        clear = Beautifier()

        (ok, beautified_text, _err) = clear.web_run(prepro_text)

        print(beautified_text)
        if(not ok):
#             cleanup([preproFile, beautFile])
            print(beaut_error)
            return(beaut_error)
        
        #Due to a bug? in the jsnice web service, we need to save the
        #input text as a file.
        min_input_file = os.path.join(baseDir,"./tmp/", str(transactionID) + ".u.js")
        with open(min_input_file, 'w') as f:
            f.write(beautified_text)
        
        try:
#             lex_ugly = Lexer(beautFile)
            lex_ugly = WebLexer(beautified_text)
            print("Lex_ugly---------------------")
            print(lex_ugly.tokenList)
            print("Lex_ugly---------------------")
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
#             cleanup([preproFile, beautFile])
            print(ib_error)
            return(ib_error)
            
        #lex_ugly.write_temp_file(tempFile)
        
        ######################## 
        #  Nice2Predict start
        ########################

        # BV: Next block left out until I figure out the pipe issue
        # BV: Update: I couldn't pipe input to N2P. TODO: FIX
        # Run the JSNice from http://www.nice2predict.org
        unuglifyJS = UnuglifyJS()
        (ok, n2p_text, _err) = unuglifyJS.run(min_input_file)
        if not ok:
            return (js_file_path, None, 'Nice2Predict fail')

        (ok, n2p_text_beautified, _err) = clear.web_run(n2p_text)
        if not ok:
            return (js_file_path, None, 'Beautifier fail')

        with open(temp_files['n2p'], 'w') as f:
            f.write(n2p_text_beautified)

        try:
            n2p_lexer = WebLexer(n2p_text_beautified)
            n2p_iBuilder = IndexBuilder(n2p_lexer.tokenList)
            n2p_scopeAnalyst = WebScopeAnalyst(n2p_text_beautified)
        except:
            return (js_file_path, None, 'IndexBuilder / ScopeAnalyst fail')

  
        ######################## 
        #   Nice2Predict End
        ########################
        
        #Do Scope related tasks
        #a raw text version
        try:
#             scopeAnalyst = ScopeAnalyst(beautFile)
            scopeAnalyst = WebScopeAnalyst(beautified_text)
        except:
#             cleanup({"temp" : tempFile})
            print(sa_error)
            return(sa_error)
        
        (name_positions, position_names, use_scopes) = prepHelpers(iBuilder_ugly, scopeAnalyst)
        
        
        #Map the jsnice names to the minified counterparts.
        orderedVarsNew = sorted(scopeAnalyst.name2defScope.keys(), key = lambda x: x[1])
        orderedVarsN2p = sorted(n2p_scopeAnalyst.name2defScope.keys(), key = lambda x: x[1])


        if(len(orderedVarsNew) != len(orderedVarsN2p)):
            return ("JsNice and New Name lists different length")


        for i in range(0, len(orderedVarsNew)):
            name_n2p = orderedVarsN2p[i][0]
            def_scope_n2p = scopeAnalyst.name2defScope[orderedVarsNew[i]]
            jsnice_name_map[(name_new, def_scope_new)] = (name_n2p, def_scope_n2p)

    
        (_name_positions, \
         position_names,
         _use_scopes) = prepHelpers(iBuilder_ugly, scopeAnalyst)
        
        

# '''
# From here on out, we need to process both the non_hash and the hash_names...
# '''
#         rn_start = time.time()
#         #try:
#         if True:
#             #We need both the base_text and the hashed_text.
#             preRen = PreRenamer()
#             print("Tokens-------------------")
#             print(iBuilder_ugly.tokens)
#             print("Tokens-------------------")
#             #We always need the non hashed names as a fallback.
#             after_text = preRen.rename(RS.NONE, 
#                                        iBuilder_ugly,
#                                        scopeAnalyst)
#             
#             (ok, renamedText, _err) = clear.web_run(after_text)
#             if not ok:
#                 print(beaut_error)
#                 return(beaut_error)
#             
#             
#             a_lexer = WebLexer(renamedText)
#             a_iBuilder = IndexBuilder(a_lexer.tokenList)
#             a_scopeAnalyst = WebScopeAnalyst(renamedText)            
#             
#             if(r_strategy != RS.NONE):
#                 after_text_hash = preRen.rename(r_strategy, 
#                                                 iBuilder_ugly,
#                                                 scopeAnalyst)
#              
#                 (ok, renamedTextHash, _err) = clear.web_run(after_text_hash)
#                 if not ok:
#                     print(beaut_error)
#                     return(beaut_error)
#                             
#                 a_lexer_hash = WebLexer(renamedTextHash)
#                 a_iBuilder_hash = IndexBuilder(a_lexer_hash.tokenList)
#                 a_scopeAnalyst_hash = WebScopeAnalyst(renamedTextHash)
# 
#             
# #        except:
# #            print(rn_error)
# #            return(rn_error)
# 
# #         with open("renameFile.txt", 'w') as renamingFile:
# #             renamingFile.writelines(renamedText)
#  
#         end = time.time()
#         rnTime = end-rn_start
#         preprocessDuration = end - start
#         
#         m_start = time.time()
#         
# 
#         translation = ""
# 
# 
# #Part of the no_renaming fallback?        
# #         orderedVarsMin = sorted(scopeAnalyst.name2defScope.keys(), key = lambda x: x[1])
# #         orderedVarsHash = sorted(a_scopeAnalyst.name2defScope.keys(), key = lambda x: x[1])
# # 
# #         if(len(orderedVarsMin) != len(orderedVarsHash)):
# #             return (js_file_path, None, "Hash and Min lists different length")
# # 
# #         for i in range(0, len(orderedVarsHash)):
# #             name_hash = orderedVarsHash[i][0]
# #             def_scope_hash = a_scopeAnalyst.name2defScope[orderedVarsHash[i]]
# # 
# #             name_min = orderedVarsMin[i][0]
# #             def_scope_min = scopeAnalyst.name2defScope[orderedVarsMin[i]]
# #             hash_name_map[(name_hash, def_scope_hash)] = (name_min, def_scope_min)
# 
#         # We can switch this back once we train models on a corpus with literals
#         # lx = WebLexer(a_iBuilder.get_text())
#         lx = WebLexer(a_iBuilder.get_text_wo_literals())
# 
#         # Translate renamed input
#         md = WebMosesDecoder(proxy)
#         (ok, translation, _err) = md.run(lx.collapsedText)
#         if not ok:
#             print(ms_error)
#             return(ms_error)
#         
#         #Get the hash text too.
#         if(r_strategy != RS.NONE):
#             lx = WebLexer(a_iBuilder.get_text_wo_literals())
#     
#             # Translate renamed input
#             md = WebMosesDecoder(proxy)
#             (ok, translation, _err) = md.run(lx.collapsedText)
#             if not ok:
#                 print(ms_error)
#                 return(ms_error)
#         
#         #Send to output:
#         #cleanup([preproFile, beautFile, tempFile])
#         
#         m_end = time.time()
#         m_time = m_end - m_start
# 
#         #Base_name is a problem to removing the temp files... (It references bogdan's original naming scheme)
#         post_start = time.time()
# 
#         (a_name_positions, 
#              a_position_names, a_use_scopes) = prepHelpers(a_iBuilder, a_scopeAnalyst)
#         
#         if translation is not None:
#             # Parse moses output
#             mp = MosesParser()
#             print(translation)
#                 
#             name_candidates = mp.parse(translation,
#                                        a_iBuilder,
#                                        a_position_names)#,
#                                        #a_scopeAnalyst)
# 
# '''
# Up to here, we can do no_renaming and hash_renaming in parallel?
# '''
        #Note: we want to put these in parallel once we've tested the
        #serial version...
        
        #Get moses output for no_renaming
        (status, error_msg, translation_default, name_candidates_default, a_iBuilder_default, 
            a_scopeAnalyst_default, a_name_positions_default, 
            a_position_names_default, a_use_scopes_default, hash_name_map_default,
            pre_time_default, rn_time_default, m_time_default, post_start_default) = getMosesTranslation(RS.NONE, RS, clear, iBuilder_ugly, scopeAnalyst, start)
        
        if(not status):
            return(error_msg)
        
        #Get moses output for hash_renaming
        (status, error_msg, translation, name_candidates, a_iBuilder, 
            a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes, hash_name_map,
            pre_time, rn_time, m_time, post_start) = getMosesTranslation(r_strategy, RS, clear, iBuilder_ugly, scopeAnalyst, start)
        
        if(not status):
            return(error_msg)
        
        if translation is not None and translation_default is not None:                               

            for key_default, suggestions in name_candidates_default.iteritems():
#                         (name_default, def_scope_default) = key_default

                pos_default = scopeAnalyst_default.nameDefScope2pos[key_default]
                (lin, col) = iBuilder_default.revFlatMat[pos_default]
                (line_num, line_idx) = iBuilder_default.revTokMap[(lin, col)]

                (name, def_scope) = a_position_names[line_num][line_idx]
                key = (name, def_scope)

                for name_translation, lines in suggestions.iteritems():
                        name_candidates.setdefault(key, {})
                        name_candidates[key].setdefault(name_translation, set([]))
                        name_candidates[key][name_translation].update(lines)
            # name_candidates is a dictionary of dictionaries: 
            # keys are (name, None) (if scopeAnalyst=None) or 
            # (name, def_scope) tuples (otherwise); 
            # values are suggested translations with the sets 
            # of line numbers on which they appear.
            print("Name_candidates")
            print(name_candidates) 
            
            # **** BV: This might be all we need to combine Naughty & Nice 
            name_candidates_copy = deepcopy(name_candidates)
            for key, suggestions in name_candidates_copy.iteritems():

                if r_strategy == RS.NONE:
                    (name_n2p, def_scope_n2p) = jsnice_name_map[key]
                else:
                    (name_n2p, def_scope_n2p) = jsnice_name_map[hash_name_map.get(key, key)]

                for name_translation, lines in suggestions.iteritems():
                    name_candidates.setdefault(key, {})
                    name_candidates[key].setdefault(name_n2p, set([]))
                    name_candidates[key][name_n2p].update(lines)
                
            cr = ConsistencyController(debug_mode=True)
                
            # An identifier may have been translated inconsistently
            # across different lines (Moses treats each line independently).
            # Try different strategies to resolve inconsistencies, if any
            
            # Compute renaming map (x -> length, y -> width, ...)
            # Note that x,y here are names after renaming
            #Hash error is occuring in here.
            (temp_renaming_map,seen) = cr.computeRenaming(c_strategy,
                                              name_candidates,
                                              a_name_positions,
                                              a_use_scopes,
                                              a_iBuilder,
                                              lm_path, {}, hash_name_map)
            print("Temp renaming map")
            print(temp_renaming_map)
            # Fall back on original names in input, if 
            # no translation was suggested
            postRen = PostRenamer()
            renaming_map = postRen.updateRenamingMap(a_name_positions, 
                                                     position_names,
                                                     a_use_scopes, 
                                                     temp_renaming_map, 
                                                     seen,
                                                     r_strategy)
            print("Renaming Map")
            print(renaming_map)
            # Apply renaming map and save output for future inspection
            renamed_text = postRen.applyRenaming(a_iBuilder, 
                                                 a_name_positions, 
                                                 renaming_map)
            (ok, beautified_renamed_text, _err) = clear.web_run(renamed_text)
            if not ok:
                print(beaut_error)
                return(beaut_error)
            print("Renamed text")
            print(renamed_text)
            

        post_end = time.time()
        post_time = post_end - post_start
        
        #Time Calculations... (Will need to update for when it becomes parallel
        return("Preprocess Time: " + str(pre_time)  + "\nRename Time (Subset of Preprocess): " + str(rn_time) + "\n" + "Moses Time: " + str(m_time) + "\n" + "Postprocess Time: " + str(post_time) + "\n" + "".join(postProcessedText))
      