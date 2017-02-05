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
from tools import Uglifier, Beautifier
from tools import UnuglifyJS
from tools import Aligner, IndexBuilder, WebLexer
from tools import PreRenamer, PostRenamer
from tools import MosesProxy, WebMosesDecoder, MosesParser
from tools import WebScopeAnalyst
from tools import TranslationSummarizer
from tools import prepHelpers, WebLMPreprocessor
from tools import RenamingStrategies, ConsistencyStrategies

from consistencyController import ConsistencyController

from folderManager import Folder



def processFile(l):
    
    js_file_path = l[0]
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
    print js_file_path
    
    temp_files = {'orig': '%s.js' % base_name,
                  'minified': '%s.u.js' % base_name,
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
    
    if True:
#     try:
        js_text = open(os.path.join(corpus_root, js_file_path), 'r').read()
        
        # Strip comments, replace literals, etc
#         if True:
#         try:
        prepro = WebLMPreprocessor(js_text)
        prepro_text = str(prepro)
#         except:
#             return (js_file_path, None, 'Preprocessor fail')
        
#         print 'Preprocessor'
#         print prepro_text
        
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        (ok, tmp_beautified_text, _err) = clear.web_run(prepro_text)
        
        
#         print '\nOK:', ok, 'ERR:', _err
#         print tmp_beautified_text
        
        if not ok:
            return (js_file_path, None, 'Beautifier fail')
        
            
        # Minify
        ugly = Uglifier()
        (ok, tmp_minified_text, _err) = ugly.web_run(tmp_beautified_text)
        
#         print '\nOK:', ok, 'ERR:', _err
#         print tmp_minified_text
        
        if not ok:
            return (js_file_path, None, 'Uglifier fail')
        
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            (aligned_clear, aligned_minified) = aligner.web_align(WebLexer(tmp_beautified_text).tokenList,
                                                                 WebLexer(tmp_minified_text).tokenList)
        except:
            return (js_file_path, None, 'Aligner fail')
        
#         print '\nAligned clear'
#         print aligned_clear
#         print '\nAligned minified'
#         print aligned_minified
#         print
        
        # Pass through beautifier to fix layout
        (ok, beautified_text, _err) = clear.web_run(aligned_clear)
        if not ok:
            return (js_file_path, None, 'Beautifier fail')
        (ok, minified_text, _err) = clear.web_run(aligned_minified)
        if not ok:
            return (js_file_path, None, 'Beautifier fail')
        
#         print beautified_text
#         print
#         print minified_text
        
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
        
        
        if beautified_text == minified_text:
            return (js_file_path, None, 'Not minified')

            
        try:
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
            return (js_file_path, None, 'IndexBuilder fail')
        
#         print 'Writing'
        
        with open(temp_files['orig'], 'w') as f:
            f.write(beautified_text)
            
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
        
#         print 'n2p'
        
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
         position_names,
         _use_scopes) = prepHelpers(iBuilder_ugly, scopeAnalyst)
          
#         print 'Helpers'

        # Try different renaming strategies (hash, etc)
        for r_strategy, proxy in proxies:
            
            print '\n====================='
            print r_strategy
            print '=====================\n'
        
#             try:
#             if True:
            # Rename input prior to translation
            preRen = PreRenamer()
            after_text = preRen.rename(r_strategy, 
                                      iBuilder_ugly,
                                      scopeAnalyst)
            
#             print 'After text:'
#             print after_text
#             print
            
            (ok, beautified_after_text, _err) = clear.web_run(after_text)
            if not ok:
                return (js_file_path, None, 'Beautifier fail')
            
#             print 'Beautified:'
#             print beautified_after_text
#             print
            
            # Save renamed input to disk for future inspection
            with open(temp_files['%s' % (r_strategy)], 'w') as f:
                f.write(beautified_after_text)
            
            a_lexer = WebLexer(beautified_after_text)
            a_iBuilder = IndexBuilder(a_lexer.tokenList)
            a_scopeAnalyst = WebScopeAnalyst(beautified_after_text)
                
#             except:
#                 return (js_file_path, None, 'Renaming fail')
            
#             print 'Lexing'
            
#             lx = WebLexer(a_iBuilder.get_text())
            lx = WebLexer(a_iBuilder.get_text_wo_literals())
            
#             print a_iBuilder.get_text_wo_literals()
            
            # Translate renamed input
            md = WebMosesDecoder(proxy)
            (ok, translation, _err) = md.run(lx.collapsedText)
            if not ok:
                return (js_file_path, None, 'Moses translation fail')
            
#             print '\ntranslation-------------'
#             print translation
            
#             if r_strategy == RS.HASH_ONE:
#                 exit()
            
            (a_name_positions, 
             a_position_names,
             a_use_scopes) = prepHelpers(a_iBuilder, a_scopeAnalyst)

            nc = []
             
            if translation is not None:
                # Parse moses output
                mp = MosesParser()
                
                print '\nr_strategy-----------', r_strategy
                
                name_candidates = mp.parse(translation,
                                           a_iBuilder,
                                           a_position_names)
                # name_candidates is a dictionary of dictionaries: 
                # keys are (name, None) (if scopeAnalyst=None) or 
                # (name, def_scope) tuples (otherwise); 
                # values are suggested translations with the sets 
                # of line numbers on which they appear.

                print '\nname_candidates before ----------'
                for key, suggestions in name_candidates.iteritems():
                    print key[0], key[1][-50:]
#                     for use_scope, suggestions in val.iteritems():
#                         print '\t...', use_scope[-50:]
                    for name_translation, lines in suggestions.iteritems():
                        print '\t', name_translation, lines
                    
                # Update name_candidates with some default values 
                # (in this case the translation without any renaming)
                # if the translation is empty
                if r_strategy == RS.NONE:
                    # RS.NONE should always be first, by construction
                    name_candidates_default = name_candidates
                    scopeAnalyst_default = a_scopeAnalyst
                    iBuilder_default = a_iBuilder
                else:
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
                                
#                         for use_scope, suggestions in val.iteritems():
#                             for name_translation, lines in suggestions.iteritems():
# #                                 key = preRen.simple_direct_map.get(key_default, key_default)
#                                  
#                                 name_candidates.setdefault(key, {})
#                                 name_candidates[key].setdefault(use_scope, {})
#                                 name_candidates[key][use_scope].setdefault(name_translation, set([]))
#                                 name_candidates[key][use_scope][name_translation].update(lines)
                                
                print '\nname_candidates after ----------'
                for key, suggestions in name_candidates.iteritems():
                    print key[0], key[1][-50:]
#                     for use_scope, suggestions in val.iteritems():
#                         print '\t...', use_scope[-50:]
                    for name_translation, lines in suggestions.iteritems():
                        print '\t', name_translation, lines
                                
                cc = ConsistencyController(debug_mode=False)
                ts = TranslationSummarizer()
                
                # An identifier may have been translated inconsistently
                # across different lines (Moses treats each line independently).
                # Try different strategies to resolve inconsistencies, if any
                for c_strategy in CS.all():
                    
                    print '\nc_strategy----------', c_strategy
                    
                    # Compute renaming map (x -> length, y -> width, ...)
                    # Note that x,y here are names after renaming
                    temp_renaming_map = cc.computeRenaming(c_strategy,
                                                      name_candidates,
                                                      a_name_positions,
                                                      a_use_scopes,
                                                      a_iBuilder,
                                                      lm_path)
                    print '\ntemp_renaming_map-------------'
                    for (name, def_scope), renaming in temp_renaming_map.iteritems():
                        print (name, def_scope[-50:]), renaming
                    
                    # Fall back on original names in input, if 
                    # no translation was suggested
                    postRen = PostRenamer()
                    renaming_map = postRen.updateRenamingMap(a_name_positions, 
                                                             position_names, 
                                                             temp_renaming_map, 
                                                             r_strategy)
                    
                    print '\nrenaming_map-------------'
                    for (name, def_scope), renaming in renaming_map.iteritems():
                        print (name, def_scope[-50:]), renaming
                    
                    # Apply renaming map and save output for future inspection
                    renamed_text = postRen.applyRenaming(a_iBuilder, 
                                                         a_name_positions, 
                                                         renaming_map)
                    
#                     print '\nrenamed_text--------------'
#                     print renamed_text
#                     print
                    
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
                        return (js_file_path, None, 'Compute summary failed')
                    nc += r
                
            if nc:
                candidates += [[r_strategy] + x for x in nc]
         
        return (js_file_path, 'OK', candidates)


#     except Exception, e:
#         return (js_file_path, None, str(e).replace("\n", ""))
    
    

if __name__=="__main__":

    corpus_root = os.path.abspath(sys.argv[1])
    testing_sample_path = os.path.abspath(sys.argv[2])
    
    output_path = Folder(sys.argv[3]).create()
    num_threads = int(sys.argv[4])
    lm_path = os.path.abspath(sys.argv[5])
    
    flog = 'log_test_' + os.path.basename(corpus_root)
    c_path = 'candidates.csv'
    
    with open(os.path.join(output_path, flog), 'w') as g, \
            open(os.path.join(output_path, c_path), 'w') as c:
        pass

    CS = ConsistencyStrategies() 
    RS = RenamingStrategies()
    
    proxies = MosesProxy().getProxies() 
    
    
    with open(testing_sample_path, 'r') as f:
    
        reader = UnicodeReader(f)
    
#         pool = multiprocessing.Pool(processes=num_threads)
        
        result = processFile(reader.next())
        if True:
#         for result in pool.imap_unordered(processFile, reader):
        
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
             

