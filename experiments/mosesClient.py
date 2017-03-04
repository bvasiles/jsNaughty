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
    
    def __init__(self, tmp_dir):
        self.tmpDir = tmp_dir
    
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
    def deobfuscateJS(self, obfuscatedCode, transactionID, debug_output):
        """
        Take a string representing minified javascript code and attempt to
        translate it into a version with better renamings.
        
        Parameters
        ----------
        obfuscatedCode: The minified javascript text.
        
        transactionID: an ID for storing temp files - used currently
        only to identify the input to JSNice.
        
        debug_output: should we print debugging output in this pass (TRUE/FALSE)
         
        Returns
        -------
        A tuple:
            renamed_text - the renamed text
            jsnice_error - "" if no error, otherwise a message stating
                           where the jsnice mixing failed
            preprocess time - total time to preprocess before invoking
                            moses servers
            jsnice time - part of the preprocessing, how long does it take
                        to get and parse jsnice names
            renaming time - how long did the hashing steps in preprocess take
            moses time - how long did the moses servers take
            postprocess time - how long did the consistency resolution and
                            language model queries take.
        """

        
        RS = RenamingStrategies()
        CS = ConsistencyStrategies()
        
        r_strategy = RS.HASH_ONE
        #c_strategy = CS.FREQLEN # or CS.LM? (CS.LM requires a language model + a querylm from moses)
        #c_strategy = CS.LM
        c_strategy = CS.LOGMODEL
        
        proxies = MosesProxy().web_proxies
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
        #Record of any errors we get in the js mixing.
        #If this feature is enabled (to be added as a switch on the website)
        #it should not crash the input if there is a failure.  If the query
        #doesn't work for some reason, then we should just use the candidate
        #names provided by moses.   
        jsnice_errors = [] 
        
        start = time.time()
        # Strip comments, replace literals, etc
        try:
        #if True:
            prepro = WebLMPreprocessor(obfuscatedCode)
            prepro_text=str(prepro)
            if(debug_output):
                print("Prepro_text----------------------------------")
                print(prepro_text)
                print("Prepro_text----------------------------------")

        except:
            return((prepro_error, "", 0, 0, 0, 0, 0))
            
        clear = Beautifier()

        (ok, beautified_text, _err) = clear.web_run(prepro_text)

        if(debug_output):
            print(beautified_text)
            
        if(not ok):
            return((beaut_error, "", 0, 0, 0, 0, 0))
        
        #Due to a bug? in the jsnice web service, we need to save the
        #input text as a file.
        min_input_file = os.path.join(self.tmpDir, str(transactionID) + ".u.js")
        with open(min_input_file, 'w') as f:
            f.write(beautified_text)
        
        try:
#             lex_ugly = Lexer(beautFile)
            lex_ugly = WebLexer(beautified_text)
            if(debug_output):
                print("Lex_ugly---------------------")
                print(lex_ugly.tokenList)
                print("Lex_ugly---------------------")
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:

            return((ib_error, "", 0, 0, 0, 0, 0))
            
        #lex_ugly.write_temp_file(tempFile)
        js_start = time.time()
        ######################## 
        #  Nice2Predict start
        ########################
        #Don't want a crashing failure for jsnice query.
        # BV: Next block left out until I figure out the pipe issue
        # BV: Update: I couldn't pipe input to N2P. TODO: FIX
        # Run the JSNice from http://www.nice2predict.org
        unuglifyJS = UnuglifyJS()
        (ok, n2p_text, _err) = unuglifyJS.run(min_input_file)
        #ok = False #Failure test
        if not ok:
            jsnice_errors.append('Nice2Predict fail')
            #return (js_file_path, None, 'Nice2Predict fail')


        if(jsnice_errors == []):
            (ok, n2p_text_beautified, _err) = clear.web_run(n2p_text)
            if not ok:
                jsnice_errors.append('Beautifier failed for JSNice.')
                #return (js_file_path, None, 'Beautifier fail')
    
            try:
                n2p_lexer = WebLexer(n2p_text_beautified)
                n2p_iBuilder = IndexBuilder(n2p_lexer.tokenList)
                n2p_scopeAnalyst = WebScopeAnalyst(n2p_text_beautified)
            except:
                jsnice_errors.append("IndexBuilder or ScopeAnalysted failed for JSNice.")
                #return (js_file_path, None, 'IndexBuilder / ScopeAnalyst fail')

  
        ######################## 
        #   Nice2Predict End
        ########################
        js_end = time.time()
        js_time = js_end - js_start
        #Do Scope related tasks
        #a raw text version
        try:
#             scopeAnalyst = ScopeAnalyst(beautFile)
            scopeAnalyst = WebScopeAnalyst(beautified_text)
        except: 
            return((sa_error, "", 0, 0, 0, 0, 0))
        
        (name_positions, position_names, use_scopes) = prepHelpers(iBuilder_ugly, scopeAnalyst)
        
        
        #Map the jsnice names to the minified counterparts.
        if(jsnice_errors == []): #only attempt if we are error free for jsnice up to this point.
            try:
                orderedVarsNew = sorted(scopeAnalyst.name2defScope.keys(), key = lambda x: x[1])
                orderedVarsN2p = sorted(n2p_scopeAnalyst.name2defScope.keys(), key = lambda x: x[1])
        
        
                if(len(orderedVarsNew) != len(orderedVarsN2p)):
                    jsnice_errors.append("JSNice and minified name lists different lengths.")
                    #raise IndexError("Length Mismatch") #Probably better to have our own defined error type, but this will do for now
                    #return ("JsNice and New Name lists different length")
        
        
                for i in range(0, len(orderedVarsNew)):
                    name_new = orderedVarsNew[i][0]
                    def_scope_new = scopeAnalyst.name2defScope[orderedVarsNew[i]]
        
                    name_n2p = orderedVarsN2p[i][0]
                    def_scope_n2p = scopeAnalyst.name2defScope[orderedVarsNew[i]]
                    jsnice_name_map[(name_new, def_scope_new)] = (name_n2p, def_scope_n2p)
            except:
                jsnice_errors.append("JSNice to minified name map building failed.")

    
        (_name_positions, \
         position_names,
         _use_scopes) = prepHelpers(iBuilder_ugly, scopeAnalyst)
        
        #Note: we want to put these in parallel once we've tested the
        #serial version...
        
        #Get moses output for no_renaming
        (status, error_msg, translation_default, name_candidates_default, iBuilder_default, 
            scopeAnalyst_default, name_positions_default, 
            position_names_default, use_scopes_default, hash_name_map_default,
            pre_time_default, rn_time_default, m_time_default, post_start_default) = getMosesTranslation(proxies[RS.NONE], RS.NONE, RS, clear, iBuilder_ugly, scopeAnalyst, start, False)
        
        if(not status):
            return((error_msg, "", 0, 0, 0, 0, 0))
        
        #Get moses output for hash_renaming
        (status, error_msg, translation, name_candidates, a_iBuilder, 
            a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes, hash_name_map,
            pre_time, rn_time, m_time, post_start) = getMosesTranslation(proxies[r_strategy], r_strategy, RS, clear, iBuilder_ugly, scopeAnalyst, start, False)
        
        if(not status):
            return((error_msg, "", 0, 0, 0, 0, 0))
        
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
            if(debug_output):
                print("Name_candidates")
                print(name_candidates) 
                
                print("jsnice_name_map")
                print(jsnice_name_map)
    
                print("hash_name_map")
                print(hash_name_map)

            # **** BV: This might be all we need to combine Naughty & Nice 
            if(jsnice_errors == []): #only attempt if we are error free for jsnice up to this point.
                try:
                    name_candidates_copy = deepcopy(name_candidates)
                    for key, suggestions in name_candidates_copy.iteritems():
                        if(debug_output):
                            print("Key: " + str(key))
                            print("Suggestions: " + str(suggestions))
                        if r_strategy == RS.NONE:
                            (name_n2p, def_scope_n2p) = jsnice_name_map[key]
                        else:
                            (name_n2p, def_scope_n2p) = jsnice_name_map[hash_name_map.get(key, key)]
        
        
                        for name_translation, lines in suggestions.iteritems():
                            name_candidates.setdefault(key, {})
                            name_candidates[key].setdefault(name_n2p, set([]))
                            name_candidates[key][name_n2p].update(lines)
                except:
                    jsnice_errors.append("Failure while adding jsnice names to candidate pool.")    
            cr = ConsistencyController(debug_mode=debug_output)
                
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
            
            if(debug_output):
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
            if(debug_output):
                print("Renaming Map")
                print(renaming_map)
            # Apply renaming map and save output for future inspection
            renamed_text = postRen.applyRenaming(a_iBuilder, 
                                                 a_name_positions, 
                                                 renaming_map)
            (ok, beautified_renamed_text, _err) = clear.web_run_end(renamed_text)
            if not ok:
                return((beaut_error, "", 0, 0, 0, 0, 0))
            
            if(debug_output):
                print("Renamed text")
                print(beautified_renamed_text)
            
        #Time Calculations... (Will need to update for when it becomes parallel
        post_end = time.time()
        post_time = post_end - post_start
        
        
        #Record any jsnice errors (but leave output blank if there are none).
        jsnice_error_string = ""
        if(jsnice_errors != []):
            jsnice_error_string = "JSNice mixing attempt failed.  Reporting renaming with only our method. \nJSNice Errors : \n"
            jsnice_error_string += "\n".join(jsnice_errors) + "\n"
            
        #Change the presentation of this to return performance information
        #and error codes as separate elements in a tuple
        #New return: translation, jsnice_error, preprocess time, js_time, rename_time
        #m_time, post_time.
        return((str(beautified_renamed_text), jsnice_error_string, 
                pre_time, js_time, rn_time, m_time, post_time))

        #return(jsnice_error_string + "Preprocess Time: " + str(pre_time)  + 
        #       "\nRename Time (Subset of Preprocess): " + str(rn_time) + "\n" + 
        #       "Moses Time: " + str(m_time) + "\n" + "Postprocess Time: " + 
        #       str(post_time) + "\n" + str(beautified_renamed_text))
      
