'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, IndexBuilder, Beautifier, UnuglifyJS, \
                    prepHelpers, TranslationSummarizer, WebMosesDecoder, \
                    WebScopeAnalyst, WebPreprocessor, WebLexer, \
                    MosesParser, ConsistencyResolver, PreRenamer, \
                    PostRenamer, RenamingStrategies, ConsistencyStrategies

from folderManager import Folder
import xmlrpclib


def processFile(l):
    
    js_file_path = l[0]
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
#     print js_file_path
    
    temp_files = {'minified': '%s.u.js' % base_name,
                  'n2p': '%s.n2p.js' % base_name}
    
    for r_strategy in RS.all():
        temp_files['%s' % (r_strategy)] = \
                    '%s.%s.js' % (base_name, r_strategy)
                    
        for c_strategy in CS.all():
            temp_files['%s_%s' % (r_strategy, c_strategy)] = \
                    '%s.%s.%s.js' % (base_name, r_strategy, c_strategy)
                    
    for k,v in temp_files.iteritems():
        temp_files[k] = os.path.join(output_path, v)
    
    
    candidates = []
    
    try:
        js_text = open(os.path.join(corpus_root, js_file_path), 'r').read()
        
        # Strip comments, replace literals, etc
        try:
            prepro = WebPreprocessor(js_text)
            prepro_text = str(prepro)
        except:
            return (js_file_path, None, 'Preprocessor fail')
        
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        (ok, beautified_text, _err) = clear.web_run(prepro_text)
        if not ok:
            return (js_file_path, None, 'Beautifier fail')
        
            
        # Minify
        ugly = Uglifier()
        (ok, minified_text, _err) = ugly.web_run(beautified_text)
        if not ok:
            return (js_file_path, None, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            lex_clear = WebLexer(beautified_text)
            tok_clear = lex_clear.tokenList
            
            lex_ugly = WebLexer(minified_text)
            tok_ugly = lex_ugly.tokenList
        except:
            return (js_file_path, None, 'Lexer fail')
       
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            return (js_file_path, None, 'Num tokens mismatch')
        
        
#         # Align minified and clear files, in case the beautifier 
#         # did something weird
#         try:
#             aligner = Aligner()
#             # This is already the baseline corpus, no (smart) renaming yet
#             aligner.align(temp_files['path_tmp_b'], 
#                           temp_files['path_tmp_u'])
#         except:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Aligner fail')
        
        
        if beautified_text == minified_text:
            return (js_file_path, None, 'Not minified')

        
        try:
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
            return (js_file_path, None, 'IndexBuilder fail')
        
        
        with open(temp_files['minified'], 'w') as f:
            f.write(minified_text)
        
        ######################## 
        #     Nice2Predict
        ########################
        
        # BV: Next block left out until I figure out the pipe issue
        # BV: Update: I couldn't pipe input to N2P. TODO: FIX
        # Run the JSNice from http://www.nice2predict.org
        unuglifyJS = UnuglifyJS()
        (ok, n2p_text, _err) = unuglifyJS.run(temp_files['minified'])
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
        
        # Save some translation stats to compare different methods
        ts = TranslationSummarizer()
        candidates += [['n2p', ''] + x 
                       for x in ts.compute_summary_unscoped(n2p_iBuilder, 
                                                            n2p_scopeAnalyst)]
            
        ################################################
        # All other JSNaughty variants
        ################################################
    
        try:
            scopeAnalyst = WebScopeAnalyst(minified_text)
        except:
            return (js_file_path, None, 'ScopeAnalyst fail')
         
        (_name_positions, \
         position_names) = prepHelpers(iBuilder_ugly, scopeAnalyst)

        # Try different renaming strategies (hash, etc)
        for r_strategy, proxy in proxies.iteritems():
        
            md = WebMosesDecoder(proxy)
            
            try:
                # Rename input prior to translation
                preRen = PreRenamer()
                after_text = preRen.rename(r_strategy, 
                                          iBuilder_ugly,
                                          scopeAnalyst)
                
                (ok, beautified_after_text, _err) = clear.web_run(after_text)
                if not ok:
                    return (js_file_path, None, 'Beautifier fail')
                
#                 print beautified_after_text
                # Save renamed input to disk for future inspection
                with open(temp_files['%s' % (r_strategy)], 'w') as f:
                    f.write(beautified_after_text)
                
                a_lexer = WebLexer(beautified_after_text)
                a_iBuilder = IndexBuilder(a_lexer.tokenList)
                a_scopeAnalyst = WebScopeAnalyst(beautified_after_text)
                
            except:
                return (js_file_path, None, 'Renaming fail')
            
            lx = WebLexer(a_iBuilder.get_text())
            
            # Translate renamed input
            (ok, translation, _err) = md.run(lx.collapsedText)
            if not ok:
                return (js_file_path, None, 'Moses translation fail')
            
            (a_name_positions, 
             a_position_names) = prepHelpers(a_iBuilder, a_scopeAnalyst)

            nc = []
             
            if translation is not None:
                # Parse moses output
                mp = MosesParser()
                
                name_candidates = mp.parse(translation,
                                           a_iBuilder,
                                           a_position_names,
                                           a_scopeAnalyst)
                # name_candidates is a dictionary of dictionaries: 
                # keys are (name, None) (if scopeAnalyst=None) or 
                # (name, def_scope) tuples (otherwise); 
                # values are suggested translations with the sets 
                # of line numbers on which they appear.
                
                cs = ConsistencyResolver()
                ts = TranslationSummarizer()
                
                # An identifier may have been translated inconsistently
                # across different lines (Moses treats each line independently).
                # Try different strategies to resolve inconsistencies, if any
                for c_strategy in CS.all():
                    
                    # Compute renaming map (x -> length, y -> width, ...)
                    # Note that x,y here are names after renaming
                    temp_renaming_map = cs.computeRenaming(c_strategy,
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
                    (ok, beautified_renamed_text, _err) = clear.web_run(renamed_text)
                    if not ok:
                        return (js_file_path, None, 'Beautifier fail')
                    with open(temp_files['%s_%s' % (r_strategy, c_strategy)], 'w') as f:
                        f.write(beautified_renamed_text)
                    
                    # Save some stats about which names were renamed to what
                    # This is what enables the comparison between the different 
                    # methods.
                    r = [[c_strategy] + x 
                         for x in ts.compute_summary_scoped(renaming_map,
                                                            name_candidates,
                                                            a_iBuilder,
                                                            a_scopeAnalyst)]
                    
                    if not r:
                        return False
                    nc += r
                
            if nc:
                candidates += [[r_strategy] + x for x in nc]
         
        return (js_file_path, 'OK', candidates)


    except Exception, e:
        return (js_file_path, None, str(e).replace("\n", ""))
    
    

if __name__=="__main__":

    corpus_root = os.path.abspath(sys.argv[1])
    testing_sample_path = os.path.abspath(sys.argv[2])
    
    output_path = Folder(sys.argv[3]).create()
    num_threads = int(sys.argv[4])
    lm_path = os.path.abspath(sys.argv[5])
    
    flog = 'log_test_' + os.path.basename(corpus_root)
    c_path = 'candidates.csv'

    CS = ConsistencyStrategies() 
    RS = RenamingStrategies()
    
    proxies = {RS.NONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"), 
               RS.NORMALIZED:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"),
               RS.SCOPE_ID:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"),
               RS.HASH_ONE:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"),
               RS.HASH_TWO:xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2")}
    
    with open(testing_sample_path, 'r') as f:
    
        reader = UnicodeReader(f)
    
        pool = multiprocessing.Pool(processes=num_threads)
        
        for result in pool.imap_unordered(processFile, reader):
        
            with open(os.path.join(output_path, flog), 'a') as g, \
                    open(os.path.join(output_path, c_path), 'a') as c:
                writer = UnicodeWriter(g)
                cw = UnicodeWriter(c)
         
                if result[1] is not None:
                    js_file_path, ok, candidates = result
                    
                    writer.writerow([js_file_path, ok])
                    
                    for r in candidates:
                        cw.writerow([js_file_path]+
                                    [str(x).replace("\"","") for x in r])
                else:
                    writer.writerow([result[0], result[2]])
             

