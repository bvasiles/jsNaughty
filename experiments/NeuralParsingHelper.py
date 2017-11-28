import os
import sys
import time
import socket
from collections import OrderedDict
# import multiprocessing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
from tools import Aligner, IndexBuilder, WebLexer
from tools import PreRenamer
from tools import SeqTag
from tools import WebScopeAnalyst
from tools import prepHelpers, WebLMPreprocessor
from tools.suggestionMetrics import *
from tools import RenamingStrategies
from tools import NeuralSequenceParser

from folderManager import Folder

dropLines = True

def removeUnchangedLines(fullText, sa_text, ib_text):
    """
    Given a text about to be preprocessed and a scope analyzer for
    that text, find which lines have no minifiable identifiers and
    remove them.
    Parameters
    ----------
    fullText: the full preprocessed text about to be submitted to
    the neural translation engine.

    sa_text: a scopeAnalyzer for that text

    ib_text: an indexBuilder for the text

    Returns:
    (filteredText, lineDropMap) - A tuple:
    filteredText - the text with all lines without minifiable identifiers
    removed.

    lineDropMap - An OrderedDict of int (the starting index of a line) to the line
    that was dropped.
    """
    #1) Get line #s with minifiable variables
    lineDropMap = OrderedDict()
    local = [n for n, isG in sa_text.isGlobal.iteritems() if isG == False] # minifiable names (name, flatID -> true)
    print(local)
    #print("------IndexBuilder------")
    #print(ib_text)
    changedLines = set()
    #ib.revFlatMat flat id -> line, col
    for name, pos in local:
        positions = ib_text.name2CharPositions[name]
        for l_id, c_id in positions:
            changedLines.add(l_id)

    print("----ChangedLines----")
    print(changedLines)
    lines = fullText.split("\n")
    filteredText = ""
    i = 0
    startTok = 0
    for l in lines:
        if(i in changedLines):
            filteredText += l + "\n"
        else:
            lineDropMap[startTok] = l

        #2) Get Start of line index for this line
        startTok += len(l.split()) #add count of tokens on the line
        i += 1

    return (filteredText, lineDropMap)

def reconstructOutput(t_out, lineDropMap):
    """
    Given the list of tokens from the output, insert
    the correct number of SAME tokens for all the lines
    removed in preprocessing as specified by the lineDropMap

    Parameters:
    -----------
    t_out - The output of the neural model (if calling this function
    make sure the model is of the nosame variant)

    lineDropMap - A map of int (the starting index of a line) to the line
    that was dropped.

    Returns:
    --------
    fullTranslation - a list of string tokens with SAME inserted in
    the correct positions.
    """

    for lineStartId, tokens in lineDropMap.iteritems():
        sameInsert = ["SAME"] * len(tokens.split())
        t_out = t_out[:lineStartId] + sameInsert + t_out[lineStartId:]

    return t_out


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
    RS = RenamingStrategies()
    r_strategy = RS.NONE
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
    
    if(debug_mode):
        print("-----------Input---------")
        print(lx.collapsedText)

    #Performance measures -> wrap up the preprocessing/ renaming
    #phases 
    end = time.time()
    rn_time = end-rn_start

    nst = SeqTag()

    #For the case
    if(dropLines):
        (filteredText, ldm) = removeUnchangedLines(lx.collapsedText, a_scopeAnalyst, a_iBuilder)
        if(debug_mode):
            print("-----FilteredText-----")
            print(filteredText)
            print("-----Line Drop Map-----")
            print(ldm)
            #quit()
        (ok, translation, _err) = nst.queryServer(filteredText)
        translation = reconstructOutput(translation, ldm)
    else:
        #Until we know how this works, let's use a mock version.
        #(ok, translation, _err) = nst.web_runCLI(lx.collapsedText)
        (ok, translation, _err) = nst.queryServer(lx.collapsedText)
        #Mock assumes using test file 1.
        #(ok, mock_translation, _err) = nst.mock_run()


    if(debug_mode):
        print("--------Output---------")
        print(ok)
        print(_err)
        print(translation)
        #print("-------Mock Translation-------")
        #print(mock_translation[0:10])
        #print(len(mock_translation))
        print(len(lx.collapsedText.split()))
        print(len(translation))
        #quit()

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
        nsp = NeuralSequenceParser()

        name_candidates = nsp.parse(translation,
                                   a_iBuilder,
                                   a_position_names)                           

    return (True, "", translation, name_candidates, a_iBuilder, 
            a_scopeAnalyst, a_name_positions, 
            a_position_names, a_use_scopes,
            rn_time, post_start)
