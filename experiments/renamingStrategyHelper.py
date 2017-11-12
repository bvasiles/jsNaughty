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
                
from tools import Aligner, IndexBuilder, WebLexer
from tools import PreRenamer
from tools import MosesProxy, WebMosesDecoder, MosesParser
from tools import WebScopeAnalyst
from tools import prepHelpers, WebLMPreprocessor
from tools import RenamingStrategies
from tools.consistency import ENTROPY_ERR
from tools.suggestionMetrics import *

from folderManager import Folder

SEGMENTED_TRANS_SIZE = 50

def changeIndex(line, counter):
    """
    Change a moses output line of format <num> ||| to
    <counter> |||
    """
    pieces = line.split("|||")
    return str(counter) + "|||" + "|||".join(pieces[1:]) 

def adjustCombinedMoses(combinedText, nbestsize):
    """
    Fix the line numbers of the moses text
    Parameters:
    ----------
    combinedText - Moses output starting with <num> ||| where the numbers aren't 
    counted correctly
    nbestsize - The number of translations returned for each input.
    Returns:
    --------
    combinedText - numbers in input are now 0, 1, 2, 3, 4, ...
    """
    counter = 0
    copy_counter = 1
    newText = ""
    for line in combinedText.split("\n"):
        newText += changeIndex(line, counter) + "\n"
        if(copy_counter < nbestsize):
            copy_counter += 1
        else:
            copy_counter = 1
            counter += 1
    return newText

def segmentedTranslation(lx, max_piece_size, proxy, debug_mode = False):
    """
    Run the moses translation in pieces of no more than max_piece_size.
    This is intended for experiments in performance improvements.
    Currently the implementation is serial, but is a candidate for parallelization
    if we had a moses server swarm (or many threaded single moses server)
    Parameters:
    -----------
    lx - a WebLexer object containing all the text to translate
    max_piece_size - The maximum number of lines to ask moses to translate
    In a single query
    proxy - the moses proxy we are using for translation
    debug_mode - True/False for printing some additional information
    n-best-list-size 
    Returns:
    --------
    (ok,    - True False status if all queries completed succesfully
    translation, - The translated text, if ok = True, original text otherwise
    _err) - Any error messages if ok = False
    """
    #lx = WebLexer(a_iBuilder.get_text_on_lines_wo_literals(line_subset))
    if(debug_mode):
        print("Invoking Moses.")
        print(lx.collapsedText)
    
    # Translate renamed input
    md = WebMosesDecoder(proxy)    
    
    lines = lx.collapsedText.split("\n")
    if(lines[-1] == u''): #Remove final newline if necessary
        lines = lines[:-1]
    line_count = len(lines)
    start = 0
    translation = []
    #Possibly can be done in parallel
    for start in range(0, line_count, max_piece_size):
        next_piece = "\n".join(lines[start:start+max_piece_size])
        (ok, next_translation, _err) = md.run(next_piece)
        translation.append((start, next_translation))
            
        if not ok:
            return(ok, lx.collapsedText, _err)
   
    #Order guarantee in case of further parallelization 
    translation = sorted(translation, key= lambda t: t[0])
    combined = reduce(lambda x, y: x+ "\n" +y, [nt[1] for nt in translation])
    #print("---------------Combined---------------")
    #print(combined)
    #print("---------------Combined---------------")
    return(True, adjustCombinedMoses(combined, MosesProxy.nbestsize), "")

def testFunc(r_strategy):
    return r_strategy

def getMosesTranslationParallel(wrapper_obj):
    """
    Wrapper function to reduce get Moses translation down to '1' argument so we
    can use it in a imap_unordered loop?
    Returns:
    -------
    (r_strategy, - an ID tag of the renaming type so we can sort the parallel
                   results into their appropriate venues.
     getMosesTranslation results) - see getMosesTranslation for output
    """
    (r_strategy, RS, a_beautifer, iBuilder_ugly, 
     scopeAnalyst_ugly, debug_mode, use_local) = wrapper_obj
    if(use_local == False):
        proxy = MosesProxy().web_proxies[r_strategy]
    else:
        proxy = MosesProxy().web_local[r_strategy]
    #tmp = getMosesTranslation(proxy, r_strategy, RS,
    #                                       a_beautifer, iBuilder_ugly,
    #                                       scopeAnalyst_ugly, debug_mode)
    #return(1)
    return (r_strategy, getMosesTranslation(proxy, r_strategy, RS, 
                                           a_beautifer, iBuilder_ugly, 
                                           scopeAnalyst_ugly, debug_mode))

def getMosesTranslation(proxy, r_strategy, RS, a_beautifier, iBuilder_ugly, scopeAnalyst_ugly, debug_mode = False):
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
    
    debug_mode: Print debug information? (True/False - defaults to False)
    
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
    
    rn_time, m_time, lex_time, post_start: The duration of the
    renaming, Moses translation steps, and lexing steps along with the start time for the
    postprocessing of the Moses output. 
    """       
    rn_start = time.time()
         

    #We need both the base_text and the hashed_text.
    preRen = PreRenamer()
    if(debug_mode):
        print("Tokens-------------------")
        print(iBuilder_ugly.tokens)
        print("Tokens-------------------")
    #We always need the non hashed names as a fallback.
    try:
        after_text = preRen.rename(r_strategy, 
                                   iBuilder_ugly,
                                   scopeAnalyst_ugly)
    except:
        return(False, "Renaming failed for " + str(r_strategy),
               "", {}, None,
               None, {},
               {}, {}, {},
               0, 0, 0, 0)
  
    (ok, beautified_after_text, _err) = a_beautifier.web_run(after_text)
    if not ok:
        return(False, "Beautifier failed on the renamed text for " + str(r_strategy), 
               "", {}, None, 
               None, {}, 
               {}, {}, {},
               0, 0, 0, 0)
 
    # Align hashed and non hashed  files, in case the beautifier 
    # line wrapped the extended lines.
    try:
        aligner = Aligner()
        (aligned_after, aligned_before) = aligner.web_align(WebLexer(beautified_after_text).tokenList,
                                                                 WebLexer(iBuilder_ugly.get_text()).tokenList)
    except:
        return(False, "Aligner failed on the renamed text for " + str(r_strategy),
               "", {}, None,
               None, {},
               {}, {}, {},
               0, 0, 0, 0)

    

    #print("--------Aligned After-------")
    #print(aligned_after)
    #print("----------------------------")

    a_lexer = WebLexer(aligned_after)
    a_iBuilder = IndexBuilder(a_lexer.tokenList)
    a_scopeAnalyst = WebScopeAnalyst(aligned_after)
       
    hash_name_map = {}
        
    
    
    if(r_strategy == RS.HASH_ONE or r_strategy == RS.HASH_TWO):

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
            
    if(debug_mode):
        print("HASH NAME MAP LEN: " + str(len(hash_name_map)))

    # We can switch this back once we train models on a corpus with literals
    # lx = WebLexer(a_iBuilder.get_text())
    lx = WebLexer(a_iBuilder.get_text_wo_literals())
    if(debug_mode):
        print("-----------------Moses In ----------------------")
        print(lx.collapsedText)
        print("------------------------------------------------")
        quit()
    #print(a_iBuilder.charPosition2Name)
    #print("------------------------------------------------")
    #line_subset = a_scopeAnalyst.getMinifiableLines(a_iBuilder)
    #line_list = sorted(list(line_subset))
    #line_map = {}
    #m_line = 0
    #for next_line in line_list:
    #    line_map[m_line] = next_line 
    #    m_line += 1
    #lx = WebLexer(a_iBuilder.get_text_on_lines_wo_literals(line_subset))
    
    #Performance measures -> wrap up the preprocessing/ renaming
    #phases 
    end = time.time()
    rn_time = end-rn_start
    m_start = time.time()
    #if(debug_mode):
    #    print("Invoking Moses.")
    #    print(lx.collapsedText)
    # Translate renamed input
    #md = WebMosesDecoder(proxy)
    #(ok, translation, _err) = md.run(lx.collapsedText)
    (ok, translation, _err) = segmentedTranslation(lx, SEGMENTED_TRANS_SIZE, proxy, debug_mode)
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
        if(debug_mode):
            print(translation)
            
        name_candidates = mp.parse(translation,
                                   a_iBuilder,
                                   a_position_names)#,
                                   #a_scopeAnalyst)
        
        #A slightly modified version of parse to remap the moses
        #output lines to the correct original lines.
        #name_candidates = mp.parse_subset(translation,
        #                                  a_iBuilder,
        #                                  a_position_names,
        #                                  line_map)
                                   
    lex_time = lx.build_time + a_lexer.build_time
    return (True, "", translation, name_candidates, a_iBuilder, 
            a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes, hash_name_map,
            rn_time, m_time, lex_time, post_start)
