import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst, \
                    UnuglifyJS, JSNice, LMQuery, MosesDecoder

from renamingStrategies import renameUsingScopeId, renameUsingHashAllPrec, \
                                renameUsingHashDefLine

from folderManager import Folder
from pygments.token import Token, is_token_subtype
from copy import deepcopy



def tryRemove(pth):
    try:
        os.remove(pth)
    except OSError:
        pass

def cleanup(pid):
    tryRemove('tmp_%d.js' % pid)
    tryRemove('tmp_%d.b.js' % pid)
    tryRemove('tmp_%d.b.a.js' % pid)
    tryRemove('tmp_%d.u.js' % pid)
    tryRemove('tmp_%d.u.a.js' % pid)
    tryRemove('tmp_%d.n2p.js' % pid)
    tryRemove('tmp_%d.jsnice.js' % pid)

def cleanupRenamed(pid):
    for strategy in ['js', 'lm.js', 'len.js', 'freqlen.js']:
        tryRemove('tmp_%d.no_renaming.%s' % (pid, strategy))
        tryRemove('tmp_%d.basic_renaming.%s' % (pid, strategy))
        tryRemove('tmp_%d.hash_renaming.%s' % (pid, strategy))
        tryRemove('tmp_%d.hash_def_one_renaming.%s' % (pid, strategy))
        tryRemove('tmp_%d.hash_def_two_renaming.%s' % (pid, strategy))
    


def processTranslation(translation, iBuilder_clear, 
                       scopeAnalyst, lm_path, f,
                       output_path, base_name, clear):
    
    nc = []
    
    def writeTmpLines(lines, out_file_path):
        js_tmp = open(out_file_path, 'w')
        js_tmp.write('\n'.join([' '.join([token for (_token_type, token) in line]) 
                                for line in lines]).encode('utf8'))
        js_tmp.write('\n')
        js_tmp.close()
        
        
    if translation is not None:


#         print f
#         print translation
#         print
#         print

        # Compute scoping 
        try:
            # name2Xscope are dictionaries where keys are (name, start_index) 
            # tuples and values are scope identifiers. Note: start_index is a 
            # flat (unidimensional) index, not (line_chr_idx, col_chr_idx).
            name2defScope = scopeAnalyst.resolve_scope()
#             name2useScope = scopeAnalyst.resolve_use_scope()
            # isGlobal has similar structure and returns True/False
            isGlobal = scopeAnalyst.isGlobal
            # name2pth has similar structure and returns AST depths
#             name2pth = scopeAnalyst.resolve_path()
            # nameOrigin[(name, def_scope)] = depth
#             nameOrigin = scopeAnalyst.nameOrigin
        except:
            return False
    
        name_candidates = {}
        
        # Collect names and their locations in various formats
        # that will come in handy later:
        
        # Which locations [(line number, index within line)] does
        # a variable name appear at?
        name_positions = {}
        
        # Which variable name is at a location specified by 
        # [line number][index within line]?
        position_names = {}
        
        for line_num, line in enumerate(iBuilder_clear.tokens):
            position_names.setdefault(line_num, {})
            
            for line_idx, (token_type, token) in enumerate(line):
                if is_token_subtype(token_type, Token.Name):
                    (l,c) = iBuilder_clear.tokMap[(line_num, line_idx)]
                    p = iBuilder_clear.flatMap[(l,c)]
                    
                    if not isGlobal.get((token, p), True):

                        def_scope = name2defScope[(token, p)]
                    
                        name_positions.setdefault((token, def_scope), [])
                        name_positions[(token, def_scope)].append((line_num, line_idx))
                        position_names[line_num][line_idx] = (token, def_scope)
    
        # Parse moses output. 
        
        lines_translated = set([])
        translations = {}
        
        for line in translation.split('\n'):
        
            parts = line.split('|||')
            if not len(parts[0]):
                continue

            # The index of the line in the input to which this
            # translated line corresponds, starting at 0:
            n = int(parts[0])
            lines_translated.add(n)

            # The translation:
            translation = parts[1].strip()
            translation_parts = translation.split(' ')

            # Only keep translations that have exactly the same 
            # number of tokens as the input
            # If the translation has more tokens, copy the input
            if len(translation_parts) != len(iBuilder_clear.tokens[n]):
                translation_parts = [token for (token_type, token) \
                                        in iBuilder_clear.tokens[n]]
                translation = ' '.join(translation_parts)
            
            # An input can have identical translations, but with
            # different scores (the number of different translations
            # per input is controlled by the -n-best-list decoder
            # parameter). Keep only unique translations.
            translations.setdefault(n, set([]))
            translations[n].add(translation)
           
            #print n, translation_parts 
 
            # Which within-line indices have non-global var names? 
            line_dict = position_names.get(n, {})
            
            # For each variable name, record its candidate translation
            # and on how many lines (among the -n-best-list) it appears on
            for line_idx in line_dict.keys():
                
                # The original variable name
                (name, def_scope) = line_dict[line_idx]
                
                # The translated variable name
                name_translation = translation_parts[line_idx]
                
                # Record the line number (we will give more weight
                # to names that appear on many translation lines) 
                name_candidates.setdefault((name, def_scope), {})
                name_candidates[(name, def_scope)].setdefault(name_translation, set([]))
                name_candidates[(name, def_scope)][name_translation].add(n)            
  
                
#         for (name, def_scope), d in name_candidates.iteritems():
#             nc.append( (def_scope, name, ','.join(d.keys())) )
  
                #print name, name_translation, n, def_scope
        
        
        def computeFreqLenRenaming(lines, name_candidates, name_positions):
            renaming_map = {}
            seen = {}
            
            # There is no uncertainty about the translation for
            # variables that have a single candidate translation
            for ((name, def_scope), val) in [((name, def_scope), val) 
                         for (name, def_scope), val in name_candidates.items() 
                         if len(val.keys()) == 1]:
                             
                candidate_name = val.keys()[0]
                
                # Don't use the same translation for different
                # variables within the same scope.
                if not seen.has_key((candidate_name, def_scope)):
                    renaming_map[(name, def_scope)] = candidate_name
                    seen[(candidate_name, def_scope)] = True
                else:
                    renaming_map[(name, def_scope)] = name
                
            # For the remaining variables, choose the translation 
            # that has the longest name
            
            token_lines = []
            for (name, def_scope), pos in name_positions.iteritems():
                # pos is a list of tuples [(line_num, line_idx)]
                token_lines.append(((name, def_scope), \
                                len(set([line_num \
                                         for (line_num, _line_idx) in pos]))))
                
            # Sort names by how many lines they appear 
            # on in the input, descending
            token_lines = sorted(token_lines, \
                         key=lambda ((name, def_scope), num_lines): -num_lines)
            
            for (name, def_scope), _num_lines in token_lines:
                # Sort candidates by how many lines in the translation
                # they appear on, and by name length, both descending
                candidates = sorted([(name_translation, len(line_nums)) \
                                     for (name_translation,line_nums) \
                                     in name_candidates[(name, def_scope)].items()], 
                                    key=lambda e:(-e[1],-len(e[0])))
                
                if len(candidates) > 1:
                    unseen_candidates = [candidate_name 
                                         for (candidate_name, _occurs) in candidates
                                         if not seen.has_key((candidate_name, def_scope))]
                    
                    if len(unseen_candidates):
                        candidate_name = unseen_candidates[0]
                        
                        renaming_map[(name, def_scope)] = candidate_name
                        seen[(candidate_name, def_scope)] = True
                    else:
                        renaming_map[(name, def_scope)] = name
                        seen[(name, def_scope)] = True
                    
            return renaming_map
        
        
        def computeLenRenaming(lines, name_candidates, name_positions):
            renaming_map = {}
            seen = {}
            
            # There is no uncertainty about the translation for
            # variables that have a single candidate translation
            for ((name, def_scope), val) in [((name, def_scope), val) 
                         for (name, def_scope), val in name_candidates.items() 
                         if len(val.keys()) == 1]:
                
                candidate_name = val.keys()[0]
                
                if not seen.has_key((candidate_name, def_scope)):
                    renaming_map[(name, def_scope)] = candidate_name
                    seen[(candidate_name, def_scope)] = True
                else:
                    renaming_map[(name, def_scope)] = name
                
            # For the remaining variables, choose the translation that 
            # has the longest name
            token_lines = []
            
            for (name, def_scope), pos in name_positions.iteritems():
                token_lines.append(((name, def_scope), \
                                    len(set([line_num \
                                         for (line_num, _line_idx) in pos]))))
                
            # Sort names by how many lines they appear 
            # on in the input, descending
            token_lines = sorted(token_lines, 
                                 key=lambda ((name, def_scope), num_lines): -num_lines)
            
            for (name, def_scope), _num_lines in token_lines:
                
                # Sort candidates by length of translation, descending
                candidates = sorted([(name_translation, len(line_nums)) \
                                     for (name_translation,line_nums) \
                                     in name_candidates[(name, def_scope)].items()],
                                    key=lambda e:-len(e[0]))
                
                if len(candidates) > 1:
                    unseen_candidates = [candidate_name 
                                         for (candidate_name, _occurs) in candidates
                                         if not seen.has_key((candidate_name, def_scope))]
                    
                    if len(unseen_candidates):
                        candidate_name = unseen_candidates[0]
                        
                        renaming_map[(name, def_scope)] = candidate_name
                        seen[(candidate_name, def_scope)] = True
                    else:
                        renaming_map[(name, def_scope)] = name
                        seen[(name, def_scope)] = True
                    
            return renaming_map
        
        
        def computeLMRenaming(lines, name_candidates, name_positions, lm_path):
            renaming_map = {}
            seen = {}

            #print name_candidates

            # There is no uncertainty about the translation for
            # variables that have a single candidate translation
            for ((name, def_scope), val) in [((name, def_scope), val) 
                         for (name, def_scope), val in name_candidates.items() 
                         if len(val.keys()) == 1]:
                             
                candidate_name = val.keys()[0]
                
                if not seen.has_key((candidate_name, def_scope)):
                    renaming_map[(name, def_scope)] = candidate_name
                    seen[(candidate_name, def_scope)] = True
                else:
                    renaming_map[(name, def_scope)] = name
                
            # For the remaining variables, choose the translation that 
            # gives the highest language model log probability
            
            token_lines = []
            
            for (name, def_scope), pos in name_positions.iteritems():
                token_lines.append(((name, def_scope), \
                                    len(set([line_num \
                                         for (line_num, _line_idx) in pos]))))
                
            # Sort names by how many lines they appear 
            # on in the input, descending
            token_lines = sorted(token_lines, 
                                 key=lambda ((name, def_scope), num_lines): -num_lines)
            
            for (name, def_scope), _num_lines in token_lines:
                # Sort candidates by how many lines in the translation
                # they appear on, and by name length, both descending
                candidates = sorted([(name_translation, len(line_nums)) \
                                     for (name_translation,line_nums) \
                                     in name_candidates[(name, def_scope)].items()], 
                                    key=lambda e:(-e[1],-len(e[0])))
                
                if len(candidates) > 1:

                    log_probs = []
                    
                    unseen_candidates = [candidate_name 
                                         for (candidate_name, _occurs) in candidates
                                         if not seen.has_key((candidate_name, def_scope))]
                    
                    if len(unseen_candidates):
                        
                        for candidate_name in unseen_candidates:
                            line_nums = set([num \
                                for (num,idx) in name_positions[(name, def_scope)]])
                            
                            draft_lines = []
                            
                            for line_num in line_nums:
                                draft_line = [token for (token_type, token) 
                                              in lines[line_num]]
                                for line_idx in [idx 
                                                 for (num, idx) in name_positions[(name, def_scope)] 
                                                 if num == line_num]:
                                    draft_line[line_idx] = candidate_name
                                    
                                draft_lines.append(' '.join(draft_line))
                                
                                
                            line_log_probs = []
                            for line in draft_lines:
                                lmquery = LMQuery(lm_path=lm_path)
                                (lm_ok, lm_log_prob, _lm_err) = lmquery.run(line)
                                
                                #print _lm_err

                                if not lm_ok:
                                    lm_log_prob = -9999999999
                                line_log_probs.append(lm_log_prob)

                            if not len(line_log_probs):
                                lm_log_prob = -9999999999
                            else:
                                lm_log_prob = float(sum(line_log_probs)/len(line_log_probs))
            
                            log_probs.append((candidate_name, lm_log_prob))
                            #print candidate_name, log_probs
                        
                        candidate_names = sorted(log_probs, key=lambda e:-e[1])
                        candidate_name = candidate_names[0][0]
                        
                        renaming_map[(name, def_scope)] = candidate_name
                        seen[(candidate_name, def_scope)] = True
                    else:
                        renaming_map[(name, def_scope)] = name
                        seen[(name, def_scope)] = True
            #print renaming_map       
            return renaming_map

            
        def rename(lines, renaming_map):
            draft_translation = deepcopy(lines)
            
            for (name, def_scope), renaming in renaming_map.iteritems():
                for (line_num, line_idx) in name_positions[(name, def_scope)]:
                    (token_type, name) = draft_translation[line_num][line_idx]
                    draft_translation[line_num][line_idx] = (token_type, renaming)

            return draft_translation
            

#         def replaceLiterals(lines, revLiteralsMap):
#             draft_translation = deepcopy(lines)
#             # Replace back literals
#             lineLengths = [len(l) for l in lines]
#             idx = 0
#             sumIdx = 0
#             for (flatIdx, literal) in revLiteralsMap:
#                 while flatIdx > sumIdx + lineLengths[idx]:
#                     sumIdx += lineLengths[idx]
#                     idx += 1
#                 (token_type, name) = draft_translation[idx][flatIdx-sumIdx]
#                 draft_translation[idx][flatIdx-sumIdx] = (token_type, literal)
#             return draft_translation

        
        strategy = f.split('.')[1]
        
        renaming_map = computeLMRenaming(iBuilder_clear.tokens, 
                                          name_candidates, 
                                          name_positions,
                                          lm_path)
        for (name, def_scope), renaming in renaming_map.iteritems():
            nc.append( (strategy+'.lm', def_scope, renaming, name, 
                        ','.join(name_candidates[(name, def_scope)])) )
        
        lm_translation = rename(iBuilder_clear.tokens, renaming_map)

        writeTmpLines(lm_translation, f[:-3] + '.lm.js')
        ok = clear.run(f[:-3] + '.lm.js', 
                       os.path.join(output_path, 
                                    '%s.%s.lm.js' % (base_name, strategy)))
        if not ok:
            return False
        
        
        renaming_map = computeLenRenaming(iBuilder_clear.tokens, 
                                            name_candidates, 
                                            name_positions)
        for (name, def_scope), renaming in renaming_map.iteritems():
            nc.append( (strategy+'.len', def_scope, renaming, name, 
                        ','.join(name_candidates[(name, def_scope)])) )
        
        len_translation = rename(iBuilder_clear.tokens, renaming_map)
        
        writeTmpLines(len_translation, f[:-3] + '.len.js')
        ok = clear.run(f[:-3] + '.len.js', 
                       os.path.join(output_path, 
                                    '%s.%s.len.js' % (base_name, strategy)))
        if not ok:
            return False

        
        renaming_map = computeFreqLenRenaming(iBuilder_clear.tokens, 
                                            name_candidates, 
                                            name_positions)
        for (name, def_scope), renaming in renaming_map.iteritems():
            nc.append( (strategy+'.freqlen', def_scope, renaming, name, 
                        ','.join(name_candidates[(name, def_scope)])) )
        
        freqlen_translation = rename(iBuilder_clear.tokens, renaming_map)
        
        writeTmpLines(freqlen_translation, f[:-3] + '.freqlen.js')
        ok = clear.run(f[:-3] + '.freqlen.js', 
                       os.path.join(output_path, 
                                    '%s.%s.freqlen.js' % (base_name, strategy)))
        if not ok:
            return False

    return nc

    


def processFile(l):
    
    def localCleanup(output_path, base_names):
        for base_name in base_names:
            tryRemove(os.path.join(output_path, base_name))
    
    js_file_path = l[0]
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
    pid = int(multiprocessing.current_process().ident)
    
    candidates = []
    
    try:
#     if True:
        # Temp files to be created during processing
        path_tmp = 'tmp_%d.js' % (pid)
        path_tmp_b = 'tmp_%d.b.js' % (pid)
        path_tmp_b_a = 'tmp_%d.b.a.js' % (pid)
        path_tmp_u = 'tmp_%d.u.js' % (pid)
        path_tmp_u_a = 'tmp_%d.u.a.js' % (pid)
        path_tmp_unugly = 'tmp_%d.n2p.js' % (pid)
        path_tmp_jsnice = 'tmp_%d.jsnice.js' % (pid)
        
        f2 = 'tmp_%d.no_renaming.js' % (pid)
        f3 = 'tmp_%d.basic_renaming.js' % (pid)
        f4 = 'tmp_%d.hash_renaming.js' % (pid)
        f5 = 'tmp_%d.hash_def_one_renaming.js' % (pid)
        f6 = 'tmp_%d.hash_def_two_renaming.js' % (pid)
        
        path_orig = '%s.js' % (base_name)
        path_ugly = '%s.u.js' % (base_name)
        path_unugly = '%s.n2p.js' % (base_name)
        path_jsnice = '%s.jsnice.js' % (base_name)
        
        # Strip comments, replace literals, etc
        try:
            prepro = Preprocessor(os.path.join(corpus_root, js_file_path))
            prepro.write_temp_file(path_tmp)
        except:
            cleanup(pid)
            return (js_file_path, None, 'Preprocessor fail')
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        ok = clear.run(path_tmp, path_tmp_b)
         
        if not ok:
            cleanup(pid)
            return (js_file_path, None, 'Beautifier 1 fail')
        
        # Minify
        ugly = Uglifier()
        ok = ugly.run(path_tmp_b, path_tmp_u)
        
        if not ok:
            cleanup(pid)
            return (js_file_path, None, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            tok_clear = Lexer(path_tmp_b).tokenList
            tok_ugly = Lexer(path_tmp_u).tokenList
        except:
            cleanup(pid)
            return (js_file_path, None, 'Lexer fail')
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(pid)
            return (js_file_path, None, 'Num tokens mismatch')
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            # This is already the baseline corpus, no (smart) renaming yet
            aligner.align(path_tmp_b, path_tmp_u)
        except:
            cleanup(pid)
            return (js_file_path, None, 'Aligner fail')
        
        try:
#             iBuilder_clear = IndexBuilder(Lexer(path_tmp_b_a).tokenList)
            iBuilder_ugly = IndexBuilder(Lexer(path_tmp_u_a).tokenList)
        except:
            cleanup(pid)
            return (js_file_path, None, 'IndexBuilder fail')
        
        
        # Store original and uglified versions
        ok = clear.run(path_tmp_u_a, os.path.join(output_path, path_ugly))
        if not ok:
            cleanup(pid)
            localCleanup(output_path, [path_ugly])
            return (js_file_path, None, 'Beautifier 2 fail')
        
        ok = clear.run(path_tmp_b_a, os.path.join(output_path, path_orig))
        if not ok:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig])
            return (js_file_path, None, 'Beautifier 3 fail')
        
        
        # Run the JSNice from http://www.nice2predict.org
        unuglifyJS = UnuglifyJS()
        (ok, _out, _err) = unuglifyJS.run(path_tmp_b_a, path_tmp_unugly)
        if not ok:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig])
            return (js_file_path, None, 'Nice2Predict fail')
        
        ok = clear.run(path_tmp_unugly, os.path.join(output_path, path_unugly))
        if not ok:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig, path_unugly])
            return (js_file_path, None, 'Beautifier 4 fail')
    
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 path_tmp_unugly))
            nameOrigin = scopeAnalyst.nameOrigin
            for (name, def_scope) in nameOrigin.iterkeys():
                candidates.append(('Nice2Predict', def_scope, name, '', ''))
        except:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig, path_unugly])
            return (js_file_path, None, 'ScopeAnalyst fail')
    
    
    
        # Run the JSNice from http://www.jsnice.org
        jsNice = JSNice()
        (ok, _out, _err) = jsNice.run(path_tmp_b_a, path_tmp_jsnice)
        if not ok:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig, path_unugly])
            return (js_file_path, None, 'JSNice fail')

        ok = clear.run(path_tmp_jsnice, os.path.join(output_path, path_jsnice))
        if not ok:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig, \
                                       path_unugly, path_jsnice])
            return (js_file_path, None, 'Beautifier 5 fail')
        
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 path_tmp_jsnice))
            nameOrigin = scopeAnalyst.nameOrigin
            for (name, def_scope) in nameOrigin.iterkeys():
                candidates.append(('JSNice', def_scope, name, '', ''))
        except:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig, \
                                       path_unugly, path_jsnice])
            return (js_file_path, None, 'ScopeAnalyst fail')
        
        
        
        # Compute scoping: name2scope is a dictionary where keys
        # are (name, start_index) tuples and values are scope identifiers. 
        # Note: start_index is a flat (unidimensional) index, 
        # not a (line_chr_idx, col_chr_idx) index.
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 path_tmp_u_a))
            _name2defScope = scopeAnalyst.resolve_scope()
            _isGlobal = scopeAnalyst.isGlobal
            _name2useScope = scopeAnalyst.resolve_use_scope()
        except:
            cleanup(pid)
            localCleanup(output_path, [path_ugly, path_orig, \
                                       path_unugly, path_jsnice])
            return (js_file_path, None, 'ScopeAnalyst fail')
        
        
        no_renaming = []
        for _line_idx, line in enumerate(iBuilder_ugly.tokens):
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        with open(f2, 'w') as f_no_renaming:
            f_no_renaming.writelines(no_renaming)
        
        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
                           'train.no_renaming', 'tuning', 'moses.ini'))
        (_moses_ok, translation, _err) = moses.run(f2)

        nc = processTranslation(translation, iBuilder_ugly, 
                       scopeAnalyst, lm_path, f2,
                       output_path, base_name, clear)
        if nc:
            candidates += nc
        
        
        # Simple renaming: disambiguate overloaded names using scope id
        basic_renaming = renameUsingScopeId(scopeAnalyst, iBuilder_ugly)
        with open(f3, 'w') as f_basic_renaming:
            f_basic_renaming.writelines(basic_renaming)
        
        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
                           'train.basic_renaming', 'tuning', 'moses.ini'))
        (_moses_ok, translation, _err) = moses.run(f3)
        nc = processTranslation(translation, iBuilder_ugly, 
                       scopeAnalyst, lm_path, f3,
                       output_path, base_name, clear)
        if nc:
            candidates += nc
            
        
        # More complicated renaming: collect the context around  
        # each name (global variables, API calls, punctuation)
        # and build a hash of the concatenation.
        hash_renaming = renameUsingHashAllPrec(scopeAnalyst, 
                                               iBuilder_ugly,
                                               debug=False)
#         print hash_renaming
        with open(f4, 'w') as f_hash_renaming:
            f_hash_renaming.writelines(hash_renaming)
        
        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
                           'train.hash_renaming', 'tuning', 'moses.ini'))
        (_moses_ok, translation, _err) = moses.run(f4)
        
        nc = processTranslation(translation, iBuilder_ugly, 
                       scopeAnalyst, lm_path, f4,
                       output_path, base_name, clear)
        if nc:
            candidates += nc
        
        hash_def_one_renaming = renameUsingHashDefLine(scopeAnalyst, 
                                                   iBuilder_ugly, 
                                                   twoLines=False,
                                                   debug=False)
        with open(f5, 'w') as f_hash_def_one_renaming:
            f_hash_def_one_renaming.writelines(hash_def_one_renaming)

        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
                           'train.hash_def_one_renaming', 'tuning', 'moses.ini'))
        (_moses_ok, translation, _err) = moses.run(f5)
        
        nc = processTranslation(translation, iBuilder_ugly, 
                       scopeAnalyst, lm_path, f5,
                       output_path, base_name, clear)
        if nc:
            candidates += nc
            

        hash_def_two_renaming = renameUsingHashDefLine(scopeAnalyst, 
                                                   iBuilder_ugly, 
                                                   twoLines=True,
                                                   debug=False)
        with open(f6, 'w') as f_hash_def_two_renaming: 
            f_hash_def_two_renaming.writelines(hash_def_two_renaming)
        
        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
                           'train.hash_def_two_renaming', 'tuning', 'moses.ini'))
        (_moses_ok, translation, _err) = moses.run(f6)
        
        nc = processTranslation(translation, iBuilder_ugly, 
                       scopeAnalyst, lm_path, f6,
                       output_path, base_name, clear)
        if nc:
            candidates += nc
            
            
        with open(os.path.join(output_path, js_file_path+'.candidates.csv'), 'a') as c:
            cw = UnicodeWriter(c)
            for r in candidates:
                cw.writerow([js_file_path]+
                                [x.replace("\"","") for x in list(r)])
        
        cleanup(pid)
        cleanupRenamed(pid)
        return (js_file_path, 'OK')


    except Exception, e:
        cleanup(pid)
        cleanupRenamed(pid)
        return (js_file_path, None, str(e).replace("\n", ""))
    
    
corpus_root = os.path.abspath(sys.argv[1])
testing_sample_path = sys.argv[2]

output_path = Folder(sys.argv[3]).create()
num_threads = int(sys.argv[4])
ini_path = os.path.abspath(sys.argv[5])
lm_path = os.path.abspath(sys.argv[6])

flog = 'log_test_' + os.path.basename(corpus_root)
#f1, f2, f3, f4, f5, f6, 
try:
    for f in [flog]:
        os.remove(os.path.join(output_path, f))
except:
    pass


# inputs = Folder(corpus_root).fullFileNames("*.js")

with open(testing_sample_path, 'r') as f:

    reader = UnicodeReader(f)

#     processFile(reader.next())

    pool = multiprocessing.Pool(processes=num_threads)
    
    for result in pool.imap_unordered(processFile, reader):
      
        with open(os.path.join(output_path, flog), 'a') as g:
            writer = UnicodeWriter(g)
    
            if result[1] is not None:
                js_file_path, ok = result
                writer.writerow([js_file_path, ok])
            else:
                writer.writerow([result[0], result[2]])
            

