import os
import sys
import time
import socket
# import multiprocessing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
from tools import Aligner, IndexBuilder, WebLexer
from tools import PreRenamer
from tools import SeqTag
from tools import WebScopeAnalyst
from tools import prepHelpers, WebLMPreprocessor
from tools.suggestionMetrics import *

from folderManager import Folder

def getNeuralSequenceTranslation(a_beautifier, iBuilder_ugly, scopeAnalyst_ugly, debug_mode = False):
    """
    A helper function so that we can run multiple different renaming
    strategies through moses in a more modular and hopefully parallelizable
    manner.  It performs hashing/no hashing preparation of the file for
    the renaming strategy specified by r_stategy, and then calls the
    appropriate moses_server.
    
    Parameters
    ----------   
    a_beautifier: a beautify object to make sure the renamed text is 
    cleanly formatted.
   
    iBuilder_ugly: Index Builder for the minified file.
   
    scopeAnalyst_ugly: Scope Analyst for the minified file.
    
    debug_mode: Print debug information? (True/False - defaults to False)
    
    Returns
    -------
    (status, error, translation, name_candidates, 
            a_iBuilder, a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes,
            rn_time, post_start)
    
    status: Did this complete without error?  If False, then the rest of the output
    besides error will be empty/null.
    
    error: What is the reason for the failure?  If status is True (successful
    completion) this is "".
    
    translation: The raw Moses output
    
    name_candidates: The set of Moses suggestions for this renaming
    
    a_iBuilder,a_scopeAnalyst: Index Builder and Scope Analyst for this renaming
    
    a_name_positions, a_posistion_names, a_use_scopes: Additional tracking info
    
    rn_time, post_start: The duration of the
    renaming and the start time for the postprocessing steps. 
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
               {}, {},
               0, 0)
  
    (ok, beautified_after_text, _err) = a_beautifier.web_run(after_text)
    if not ok:
        return(False, "Beautifier failed on the renamed text for " + str(r_strategy), 
               "", {}, None, 
               None, {}, 
               {}, {},
               0, 0)
 
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
               {}, {},
               0, 0)

    
    a_lexer = WebLexer(aligned_after)
    a_iBuilder = IndexBuilder(a_lexer.tokenList)
    a_scopeAnalyst = WebScopeAnalyst(aligned_after)


    # We can switch this back once we train models on a corpus with literals
    # lx = WebLexer(a_iBuilder.get_text())
    lx = WebLexer(a_iBuilder.get_text_wo_literals())
    
    #Performance measures -> wrap up the preprocessing/ renaming
    #phases 
    end = time.time()
    rn_time = end-rn_start


    nst = SeqTag()
    (ok, translation, _err) = nst.web_runCLI(lx)

    if not ok:
        return(False, "Neural Sequence Translation Failed " + str(r_strategy), 
               translation, {}, a_iBuilder, 
               a_scopeAnalyst, {}, 
               {}, {},
               0, 0)
    
    
    post_start = time.time()
    
    (a_name_positions, 
         a_position_names, a_use_scopes) = prepHelpers(a_iBuilder, a_scopeAnalyst)
    
    if translation is not None:
        # Parse Neural output
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
                                   
    return (True, "", translation, name_candidates, a_iBuilder, 
            a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes,
            rn_time, post_start)
