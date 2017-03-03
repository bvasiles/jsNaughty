'''
Created on Feb 23, 2017

@author: Casey Casalnuovo


'''

import os
import sys
import time
import socket
# import multiprocessing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
from tools import IndexBuilder, WebLexer
from tools import PreRenamer
from tools import MosesProxy, WebMosesDecoder, MosesParser
from tools import WebScopeAnalyst
from tools import prepHelpers, WebLMPreprocessor
from tools import RenamingStrategies
from tools.consistency import ENTROPY_ERR
from tools.suggestionMetrics import *

from folderManager import Folder

def getMosesTranslation(proxy, r_strategy, RS, a_beautifier, iBuilder_ugly, scopeAnalyst_ugly, start):
    """
    A helper function so that we can run multiple different renaming
    strategies through moses in a more modular and hopefully parallelizable
    manner.  It performs hashing/no hashing preparation of the file for
    the renaming strategy specified by r_stategy, and then calls the
    appropriate moses_server.
    
    Parameters
    ----------
    proxy: A pointer to which port the appropriate moses server is listening in on
    for this particular renaming strategy.

    r_strategy: One of the renaming strategies from RenamingStrategies
    
    RS: A renaming strategies object.
    
    a_beautifier: a beautify object to make sure the renamed text is 
    cleanly formatted.
   
    iBuilder_ugly: Index Builder for the minified file.
   
    scopeAnalyst_ugly: Scope Analyst for the minified file.
   
    start: The starting time for the preprocessing step.  Used for performance
    metrics.
    
    Returns
    -------
    (status, error, translation, name_candidates, 
            a_iBuilder, a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes, hash_name_map,
            pre_time, rn_time, m_time, post_start)
    
    status: Did this complete without error?  If False, then the rest of the output
    besides error will be empty/null.
    
    error: What is the reason for the failure?  If status is True (successful
    completion) this is "".
    
    translation: The raw Moses output
    
    name_candidates: The set of Moses suggestions for this renaming
    
    a_iBuilder,a_scopeAnalyst: Index Builder and Scope Analyst for this renaming
    
    a_name_positions, a_posistion_names, a_use_scopes: Addition tracking info
    
    hash_name_map: a map from the hashed names to the original minified names 
    
    pre_time, rn_time, m_time, post_start: The duration of the preprocessing,
    renaming, and Moses translation steps, along with the start time for the
    postprocessing of the Moses output. 
    """       
    rn_start = time.time()
         

    #We need both the base_text and the hashed_text.
    preRen = PreRenamer()
    print("Tokens-------------------")
    print(iBuilder_ugly.tokens)
    print("Tokens-------------------")
    #We always need the non hashed names as a fallback.
    after_text = preRen.rename(r_strategy, 
                               iBuilder_ugly,
                               scopeAnalyst_ugly)
   
    (ok, beautified_after_text, _err) = a_beautifier.web_run(after_text)
    if not ok:
        return(False, "Beautifier failed on the renamed text for " + str(r_strategy), 
               "", {}, a_iBuilder, 
               a_scopeAnalyst, {}, 
               {}, {}, {},
               0, 0, 0, 0)
            
    a_lexer = WebLexer(beautified_after_text)
    a_iBuilder = IndexBuilder(a_lexer.tokenList)
    a_scopeAnalyst = WebScopeAnalyst(beautified_after_text)
       
    hash_name_map = {}
    
    
    if(r_strategy == RS.HASH_ONE or r_strategy == RS.HASH_TWO):
        print("BUILDING HASH NAME MAP")

        #Something below here is buggy...
        orderedVarsMin = sorted(scopeAnalyst_ugly.name2defScope.keys(), key = lambda x: x[1])
        orderedVarsHash = sorted(a_scopeAnalyst.name2defScope.keys(), key = lambda x: x[1])
        #print("Min len: " + str(len(orderedVarsMin)))
        #print("Hash len: " + str(len(orderedVarsHash))) 
        if(len(orderedVarsMin) != len(orderedVarsHash)):
            return(False, "Mismatch between minified and hashed names.", 
                   "", {}, a_iBuilder, 
                   a_scopeAnalyst, {}, 
                   {}, {}, {},
                   0, 0, 0, 0)    
        
         
        for i in range(0, len(orderedVarsHash)):
            name_hash = orderedVarsHash[i][0]
            def_scope_hash = a_scopeAnalyst.name2defScope[orderedVarsHash[i]]
     
            name_min = orderedVarsMin[i][0]
            def_scope_min = scopeAnalyst_ugly.name2defScope[orderedVarsMin[i]]
            hash_name_map[(name_hash, def_scope_hash)] = (name_min, def_scope_min)

    print("HASH NAME MAP LEN: " + str(len(hash_name_map)))

    # We can switch this back once we train models on a corpus with literals
    # lx = WebLexer(a_iBuilder.get_text())
    lx = WebLexer(a_iBuilder.get_text_wo_literals())
    
    #Performance measures -> wrap up the preprocessing/ renaming
    #phases 
    end = time.time()
    rn_time = end-rn_start
    pre_time = end - start
    m_start = time.time()
    print("Invoking Moses.")
    # Translate renamed input
    md = WebMosesDecoder(proxy)
    (ok, translation, _err) = md.run(lx.collapsedText)
    if not ok:
        return(False, "Moses server failed for " + str(r_strategy), 
               translation, {}, a_iBuilder, 
               a_scopeAnalyst, {}, 
               {}, {}, hash_name_map,
               0, 0, 0, 0)
    
    
    m_end = time.time()
    m_time = m_end - m_start
    
    post_start = time.time()
    
    (a_name_positions, 
         a_position_names, a_use_scopes) = prepHelpers(a_iBuilder, a_scopeAnalyst)
    
    if translation is not None:
        # Parse moses output
        mp = MosesParser()
        print(translation)
            
        name_candidates = mp.parse(translation,
                                   a_iBuilder,
                                   a_position_names)#,
                                   #a_scopeAnalyst)
    return (True, "", translation, name_candidates, a_iBuilder, 
            a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes, hash_name_map,
            pre_time, rn_time, m_time, post_start)
