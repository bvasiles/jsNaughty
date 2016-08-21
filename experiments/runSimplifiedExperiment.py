import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst, \
                    UnuglifyJS, JSNice, LMQuery, MosesDecoder

from renamingStrategies import renameUsingHashDefLine

from folderManager import Folder
from pygments.token import Token, is_token_subtype
from copy import deepcopy



def tryRemove(pth):
    try:
        os.remove(pth)
    except OSError:
        pass

    
def cleanup(temp_files):
    for file_path in temp_files: #.itervalues():
        tryRemove(file_path)


def cleanupRenamed(pid):
    for strategy in ['js', 'lm.js', 'len.js', 'freqlen.js',
                     'unscoped.lm.js', 'unscoped.len.js', 
                     'unscoped.freqlen.js']:
        tryRemove('tmp_%d.no_renaming.%s' % (pid, strategy))
#         tryRemove('tmp_%d.basic_renaming.%s' % (pid, strategy))
#         tryRemove('tmp_%d.hash_renaming.%s' % (pid, strategy))
        tryRemove('tmp_%d.hash_def_one_renaming.%s' % (pid, strategy))
#         tryRemove('tmp_%d.hash_def_two_renaming.%s' % (pid, strategy))
    



def writeTmpLines(lines, 
                  out_file_path):
    
    js_tmp = open(out_file_path, 'w')
    js_tmp.write('\n'.join([' '.join([token for (_token_type, token) in line]) 
                            for line in lines]).encode('utf8'))
    js_tmp.write('\n')
    js_tmp.close()



def prepareHelpers(iBuilder, 
                   scopeAnalyst=None):

    # Collect names and their locations in various formats
    # that will come in handy later:
    
    # Which locations [(line number, index within line)] does
    # a variable name appear at?
    name_positions = {}
    
    # Which variable name is at a location specified by 
    # [line number][index within line]?
    position_names = {}
    
    for line_num, line in enumerate(iBuilder.tokens):
        position_names.setdefault(line_num, {})
        
        for line_idx, (token_type, token) in enumerate(line):
            
            if is_token_subtype(token_type, Token.Name):
                (l,c) = iBuilder.tokMap[(line_num, line_idx)]
                p = iBuilder.flatMap[(l,c)]
                
#                 cond = False
                if scopeAnalyst is not None:
                    name2defScope = scopeAnalyst.resolve_scope()
                    isGlobal = scopeAnalyst.isGlobal
            
#                     if not False: #isGlobal.get((token, p), True):
                    try:
                        def_scope = name2defScope[(token, p)]
                        
                        name_positions.setdefault((token, def_scope), [])
                        name_positions[(token, def_scope)].append((line_num, line_idx))
                        position_names[line_num][line_idx] = (token, def_scope)
                    except KeyError:
                        pass

#                         cond = True
# #                         print (token, def_scope), line_num, line_idx
                
                else:
                    def_scope = None
                
                    name_positions.setdefault((token, def_scope), [])
                    name_positions[(token, def_scope)].append((line_num, line_idx))
                    position_names[line_num][line_idx] = (token, def_scope)

#                     cond = True
#                 if cond:
#                     print (token, def_scope), line_num, line_idx
                

    return (name_positions, position_names)
                


def parseMosesOutput(moses_output, 
                     iBuilder,
                     position_names):
        
    name_candidates = {}
        
    for line in moses_output.split('\n'):
    
        translations = {}
        
        parts = line.split('|||')
        if not len(parts[0]):
            continue

        # The index of the line in the input to which this
        # translated line corresponds, starting at 0:
        n = int(parts[0])

        # The translation:
        translation = parts[1].strip()
        translation_parts = translation.split(' ')

        # Only keep translations that have exactly the same 
        # number of tokens as the input
        # If the translation has more tokens, copy the input
        if len(translation_parts) != len(iBuilder.tokens[n]):
            translation_parts = [token for (_token_type, token) \
                                    in iBuilder.tokens[n]]
            translation = ' '.join(translation_parts)
        
        # An input can have identical translations, but with
        # different scores (the number of different translations
        # per input is controlled by the -n-best-list decoder
        # parameter). Keep only unique translations.
        translations.setdefault(n, set([]))
        translations[n].add(translation)
       
        # Which within-line indices have non-global var names? 
        line_dict = position_names.get(n, {})
        
        # For each variable name, record its candidate translation
        # and on how many lines (among the -n-best-list) it appears on
        for line_idx in line_dict.keys():
            
            # The original variable name
            k = line_dict[line_idx]
            
            # The translated variable name
            name_translation = translation_parts[line_idx]
            
            # Record the line number (we will give more weight
            # to names that appear on many translation lines) 
            name_candidates.setdefault(k, {})
            name_candidates[k].setdefault(name_translation, set([]))
            name_candidates[k][name_translation].add(n) 
                
    return name_candidates



def computeFreqLenRenaming(name_candidates, 
                           name_positions,
                           sorting_key):
    
    renaming_map = {}
    seen = {}
    
    # There is no uncertainty about the translation for
    # variables that have a single candidate translation
    for (key, val) in [(key, val) 
                       for key, val in name_candidates.items() 
                       if len(val.keys()) == 1]:
                     
        (name, def_scope) = key
        candidate_name = val.keys()[0]
        
        # Don't use the same translation for different
        # variables within the same scope.
        if not seen.has_key((candidate_name, def_scope)):
            renaming_map[key] = candidate_name
            seen[(candidate_name, def_scope)] = True
            
        else:
            renaming_map[key] = name
        
    # For the remaining variables, choose the translation 
    # that has the longest name
    token_lines = []
    for key, pos in name_positions.iteritems():
        # pos is a list of tuples [(line_num, line_idx)]
        token_lines.append((key, 
                            len(set([line_num 
                                     for (line_num, _line_idx) in pos]))))
        
    # Sort names by how many lines they appear 
    # on in the input, descending
    token_lines = sorted(token_lines, \
                 key=lambda (key, num_lines): -num_lines)
    
    for key, _num_lines in token_lines:
        # Sort candidates by how many lines in the translation
        # they appear on, and by name length, both descending
        candidates = sorted([(name_translation, len(line_nums)) \
                             for (name_translation, line_nums) \
                             in name_candidates[key].items()], 
                            key=sorting_key) #lambda e:(-e[1],-len(e[0])))
        
        if len(candidates) > 1:
            (name, def_scope) = key
            unseen_candidates = [candidate_name 
                                 for (candidate_name, _occurs) in candidates
                                 if not seen.has_key((candidate_name, def_scope))]
            
            if len(unseen_candidates):
                candidate_name = unseen_candidates[0]
                
                renaming_map[key] = candidate_name
                seen[(candidate_name, def_scope)] = True
            else:
                renaming_map[key] = name
                seen[(name, def_scope)] = True
            
    return renaming_map



def computeLMRenaming(name_candidates, 
                      name_positions,
                      iBuilder, 
                      lm_path):
    
    renaming_map = {}
    seen = {}

    # There is no uncertainty about the translation for
    # variables that have a single candidate translation
    for (key, val) in [(key, val) 
                 for key, val in name_candidates.items() 
                 if len(val.keys()) == 1]:
                     
        (name, def_scope) = key
        candidate_name = val.keys()[0]
        
        if not seen.has_key((candidate_name, def_scope)):
            renaming_map[key] = candidate_name
            seen[(candidate_name, def_scope)] = True
            
        else:
            renaming_map[(name, def_scope)] = name
        
    # For the remaining variables, choose the translation that 
    # gives the highest language model log probability
    
    token_lines = []
    
    for key, pos in name_positions.iteritems():
        token_lines.append((key, \
                            len(set([line_num \
                                 for (line_num, _line_idx) in pos]))))
        
    # Sort names by how many lines they appear 
    # on in the input, descending
    token_lines = sorted(token_lines, key=lambda e: -e[1])
#     print token_lines
    
    for key, _num_lines in token_lines:
        # Sort candidates by how many lines in the translation
        # they appear on, and by name length, both descending
        candidates = sorted([(name_translation, len(line_nums)) \
                             for (name_translation, line_nums) \
                             in name_candidates[key].items()], 
                            key=lambda e:(-e[1],-len(e[0])))
        
        if len(candidates) > 1:

            log_probs = []
            
            (name, def_scope) = key
            unseen_candidates = [candidate_name 
                                 for (candidate_name, _occurs) in candidates
                                 if not seen.has_key((candidate_name, def_scope))]
            
            if len(unseen_candidates):
                
                for candidate_name in unseen_candidates:
                    line_nums = set([num \
                        for (num,idx) in name_positions[key]])
                    
                    draft_lines = []
                    
                    for line_num in line_nums:
                        draft_line = [token for (_token_type, token) 
                                      in iBuilder.tokens[line_num]]
                        for line_idx in [idx 
                                         for (num, idx) in name_positions[key] 
                                         if num == line_num]:
                            draft_line[line_idx] = candidate_name
                            
                        draft_lines.append(' '.join(draft_line))
                        
                        
                    line_log_probs = []
                    for line in draft_lines:
                        lmquery = LMQuery(lm_path=lm_path)
                        (lm_ok, lm_log_prob, _lm_err) = lmquery.run(line)
                        
                        if not lm_ok:
                            lm_log_prob = -9999999999
                        line_log_probs.append(lm_log_prob)

                    if not len(line_log_probs):
                        lm_log_prob = -9999999999
                    else:
                        lm_log_prob = float(sum(line_log_probs)/len(line_log_probs))
    
                    log_probs.append((candidate_name, lm_log_prob))
                
                candidate_names = sorted(log_probs, key=lambda e:-e[1])
                candidate_name = candidate_names[0][0]
                
                renaming_map[key] = candidate_name
                seen[(candidate_name, def_scope)] = True
                
            else:
                renaming_map[key] = name
                seen[key] = True
           
    return renaming_map

     

def rename(iBuilder, name_positions, renaming_map):
    draft_translation = deepcopy(iBuilder.tokens)
    
    for (name, def_scope), renaming in renaming_map.iteritems():
        for (line_num, line_idx) in name_positions[(name, def_scope)]:
            (token_type, name) = draft_translation[line_num][line_idx]
            draft_translation[line_num][line_idx] = (token_type, renaming)

    return draft_translation



def isHash(name):
    # _45e4313f
    return len(name) == 9 and name[0] == '_' and name[1:].isalnum()
 
    
def renameHashed(iBuilder, name_positions, renaming_map):
    draft_translation = deepcopy(iBuilder.tokens)
    for (name, def_scope), renaming in renaming_map.iteritems():
        for (line_num, line_idx) in name_positions[(name, def_scope)]:
            (token_type, name) = draft_translation[line_num][line_idx]
            if not isHash(renaming):
                draft_translation[line_num][line_idx] = (token_type, renaming)

    return draft_translation



def summarizeScopedTranslation(renaming_map,
                               f_path,
                               translation_strategy,
                               output_path,
                               base_name,
                               name_candidates,
                               name_positions,
                               iBuilder,
                               scopeAnalyst):

    nc = []
        
    f_base = os.path.basename(f_path)
    training_strategy = f_base.split('.')[1]
    tmp_path = '%s.%s.js' % (f_base[:-3], translation_strategy)
    o_path = '%s.%s.%s.js' % (base_name, training_strategy, translation_strategy)
    
#     print f_path, f_base, training_strategy, tmp_path, o_path, base_name
    
    isGlobal = scopeAnalyst.isGlobal
    
    for (name, def_scope), renaming in renaming_map.iteritems():
            
        pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
            
        (lin,col) = iBuilder.revFlatMat[pos]
        (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
        
        nc.append( ('%s.%s' % (training_strategy, translation_strategy), 
                    def_scope, 
                    tok_lin, tok_col, 
                    isGlobal.get((name, pos), True),
                    renaming,
                    ','.join(name_candidates[(name, def_scope)])) )
    
    writeTmpLines(renameHashed(iBuilder, name_positions, renaming_map), tmp_path)
    
    clear = Beautifier()
    ok = clear.run(tmp_path, os.path.join(output_path, o_path))
    if not ok:
        return False
    return nc



def summarizeUnscopedTranslation(renaming_map,
                               f_path,
                               translation_strategy,
                               output_path,
                               base_name,
                               name_candidates,
                               name_positions,
                               iBuilder):

    nc = []
    
    f_base = os.path.basename(f_path)
    training_strategy = f_base.split('.')[1]
    tmp_path = '%s.%s.js' % (f_base[:-3], translation_strategy)
    o_path = '%s.%s.unscoped.%s.js' % (base_name, training_strategy, translation_strategy)
    
#     print f_path, f_base, training_strategy, tmp_path, o_path, base_name
    
    writeTmpLines(renameHashed(iBuilder, name_positions, renaming_map), tmp_path)
    
    clear = Beautifier()
    ok = clear.run(tmp_path, os.path.join(output_path, o_path))
    if not ok:
        return False
    
    try:
        lexer = Lexer(os.path.join(output_path, o_path))
        iBuilder_local = IndexBuilder(lexer.tokenList)
    
        scopeAnalyst_local = ScopeAnalyst(os.path.join(output_path, o_path))
    except:
        return False
    
    nameOrigin = scopeAnalyst_local.nameOrigin
    isGlobal = scopeAnalyst_local.isGlobal
     
    for (name, def_scope) in nameOrigin.iterkeys():
        
        pos = scopeAnalyst_local.nameDefScope2pos[(name, def_scope)]
        
        if not False: #isGlobal.get((name, pos), True):
            (lin,col) = iBuilder_local.revFlatMat[pos]
            (tok_lin, tok_col) = iBuilder_local.revTokMap[(lin,col)]
    
            nc.append( ('%s.unscoped.%s' % (training_strategy, translation_strategy), 
                    def_scope, 
                    tok_lin, tok_col, 
                    isGlobal.get((name, pos), True),
                    name,
                    '','') )
            
    return nc
    
    

def processTranslationScoped(translation, iBuilder, 
                       scopeAnalyst, lm_path, f_path,
                       output_path, base_name):
    
    nc = []
    
    if translation is not None:

        (name_positions, 
         position_names) = prepareHelpers(iBuilder, scopeAnalyst)
        
        # Parse moses output
        name_candidates = parseMosesOutput(translation,
                                           iBuilder,
                                           position_names)
        # name_candidates is a dictionary of dictionaries: 
        # keys are (name, None) (if scopeAnalyst=None) or 
        # (name, def_scope) tuples (otherwise); 
        # values are suggested translations with the sets 
        # of line numbers on which they appear.

        r = summarizeScopedTranslation(computeLMRenaming(name_candidates,
                                                         name_positions,
                                                         iBuilder,
                                                         lm_path),
                                       f_path,
                                       'lm',
                                       output_path,
                                       base_name,
                                       name_candidates,
                                       name_positions,
                                       iBuilder,
                                       scopeAnalyst)
        if not r:
            return False
        nc += r

        
#         r = summarizeScopedTranslation(computeFreqLenRenaming(name_candidates,
#                                                               name_positions,
#                                                               lambda e:-len(e[0])),
#                                        f_path,
#                                        'len',
#                                        output_path,
#                                        base_name,
#                                        name_candidates,
#                                        name_positions,
#                                        iBuilder,
#                                        scopeAnalyst)
#         if not r:
#             return False
#         nc += r
        
        
        r = summarizeScopedTranslation(computeFreqLenRenaming(name_candidates,
                                                              name_positions,
                                                              lambda e:(-e[1],-len(e[0]))),
                                       f_path,
                                       'freqlen',
                                       output_path,
                                       base_name,
                                       name_candidates,
                                       name_positions,
                                       iBuilder,
                                       scopeAnalyst)
        if not r:
            return False
        nc += r
        

    return nc



def processTranslationUnscoped(translation, iBuilder, lm_path, 
                               f_path, output_path, base_name):
    
    nc = []
    
    if translation is not None:

        (name_positions, 
         position_names) = prepareHelpers(iBuilder, None)
        
        # Parse moses output
        name_candidates = parseMosesOutput(translation,
                                           iBuilder,
                                           position_names)

        r = summarizeUnscopedTranslation(computeLMRenaming(name_candidates,
                                                         name_positions,
                                                         iBuilder,
                                                         lm_path),
                                       f_path,
                                       'lm',
                                       output_path,
                                       base_name,
                                       name_candidates,
                                       name_positions,
                                       iBuilder)
        if not r:
            return False
        nc += r

        
#         r = summarizeUnscopedTranslation(computeFreqLenRenaming(name_candidates,
#                                                               name_positions,
#                                                               lambda e:-len(e[0])),
#                                        f_path,
#                                        'len',
#                                        output_path,
#                                        base_name,
#                                        name_candidates,
#                                        name_positions,
#                                        iBuilder)
#         if not r:
#             return False
#         nc += r
        
        
        r = summarizeUnscopedTranslation(computeFreqLenRenaming(name_candidates,
                                                              name_positions,
                                                              lambda e:(-e[1],-len(e[0]))),
                                       f_path,
                                       'freqlen',
                                       output_path,
                                       base_name,
                                       name_candidates,
                                       name_positions,
                                       iBuilder)
        if not r:
            return False
        nc += r
        

    return nc


                
  

def processFile(l):
    
    js_file_path = l[0]
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
    pid = int(multiprocessing.current_process().ident)

    temp_files = {'path_tmp': 'tmp_%d.js' % pid,
                  'path_tmp_b': 'tmp_%d.b.js' % pid,
                  'path_tmp_b_1': 'tmp_%d.b.1.js' % pid,
                  'path_tmp_b_2': 'tmp_%d.b.2.js' % pid,
                  'path_tmp_b_a': 'tmp_%d.b.a.js' % pid,
                  'path_tmp_u': 'tmp_%d.u.js' % pid,
                  'path_tmp_u_a': 'tmp_%d.u.a.js' % pid,
                  'path_tmp_unugly': 'tmp_%d.n2p.js' % pid,
                  'path_tmp_unugly_1': 'tmp_%d.n2p.1.js' % pid,
                  'path_tmp_unugly_2': 'tmp_%d.n2p.2.js' % pid,
                  'path_tmp_jsnice': 'tmp_%d.jsnice.js' % pid,
                  'f2': 'tmp_%d.no_renaming.js' % pid,
#                   'f3': 'tmp_%d.basic_renaming.js' % pid,
#                   'f4': 'tmp_%d.hash_renaming.js' % pid,
                  'f5': 'tmp_%d.hash_def_one_renaming.js' % pid,
#                   'f6': 'tmp_%d.hash_def_two_renaming.js' % pid,
                  'path_orig': os.path.join(output_path, 
                                            '%s.js' % base_name),
                  'path_ugly': os.path.join(output_path, 
                                            '%s.u.js' % base_name),
                  'path_unugly': os.path.join(output_path, 
                                              '%s.n2p.js' % base_name),
                  'path_jsnice': os.path.join(output_path, 
                                              '%s.jsnice.js' % base_name)}
    
#     for strategy in ['js', 'lm.js', 'len.js', 'freqlen.js']:
#         for renaming in ['no_renaming', 'hash_def_one_renaming']:
#             temp_files['path_tmp_%s_%s' % (renaming, strategy)] = \
#                     'tmp_%d.%s.%s' % (pid, renaming, strategy)


    candidates = []
    
#     if True:
    try:
        
        # Strip comments, replace literals, etc
        try:
            prepro = Preprocessor(os.path.join(corpus_root, 
                                               js_file_path))
            prepro.write_temp_file(temp_files['path_tmp'])
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'Preprocessor fail')
        
        
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        ok = clear.run(temp_files['path_tmp'], 
                       temp_files['path_tmp_b_1'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
         
        jsNiceBeautifier = JSNice(flags=['--no-types', '--no-rename'])
        
        (ok, _out, _err) = jsNiceBeautifier.run(temp_files['path_tmp_b_1'], 
                                                temp_files['path_tmp_b_2'])
        if not ok:
            cleanup(temp_files)
            print js_file_path, _err
            return (js_file_path, None, 'JSNice Beautifier fail')

        ok = clear.run(temp_files['path_tmp_b_2'], 
                       temp_files['path_tmp_b'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
         
         
        # Weird JSNice renamings despite --no-rename
        try:
            before = set([token for (token, token_type) in 
                          Lexer(temp_files['path_tmp_b_1']).tokenList
                          if is_token_subtype(token_type, Token.Name)]) 
            after = set([token for (token, token_type) in 
                          Lexer(temp_files['path_tmp_b']).tokenList
                          if is_token_subtype(token_type, Token.Name)])
            
            if not before == after:
                return (js_file_path, None, 'Weird JSNice renaming')
            
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'Lexer fail')
         
         
        # Minify
        ugly = Uglifier()
        ok = ugly.run(temp_files['path_tmp_b'], 
                      temp_files['path_tmp_u'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            tok_clear = Lexer(temp_files['path_tmp_b']).tokenList
            tok_ugly = Lexer(temp_files['path_tmp_u']).tokenList
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'Lexer fail')
       
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
            cleanup(temp_files)
            return (js_file_path, None, 'Num tokens mismatch')
        
        
        # Align minified and clear files, in case the beautifier 
        # did something weird
        try:
            aligner = Aligner()
            # This is already the baseline corpus, no (smart) renaming yet
            aligner.align(temp_files['path_tmp_b'], 
                          temp_files['path_tmp_u'])
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'Aligner fail')
        
        
        
        if open(temp_files['path_tmp_b']).read() == \
                open(temp_files['path_tmp_u']).read():
            cleanup(temp_files)
            return (js_file_path, None, 'Not minified')

        
        try:
            lex_ugly = Lexer(temp_files['path_tmp_u_a'])
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'IndexBuilder fail')
        
        ############################################################ 
        # From now on only work with path_tmp_b_a and path_tmp_u_a
        ############################################################
        
        # Store original and uglified versions
        ok = clear.run(temp_files['path_tmp_b_a'], 
                       temp_files['path_orig'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
        
        ok = clear.run(temp_files['path_tmp_u_a'], 
                       temp_files['path_ugly'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
        
        
        
        # Run the JSNice from http://www.nice2predict.org
        unuglifyJS = UnuglifyJS()
        (ok, _out, _err) = unuglifyJS.run(temp_files['path_tmp_u_a'], 
                                          temp_files['path_tmp_unugly'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Nice2Predict fail')
        
        ok = clear.run(temp_files['path_tmp_unugly'], 
                       temp_files['path_tmp_unugly_1'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
        
        (ok, _out, _err) = jsNiceBeautifier.run(temp_files['path_tmp_unugly_1'], 
                                                temp_files['path_tmp_unugly_2'])
        if not ok:
            cleanup(temp_files)
            print js_file_path, _err
            return (js_file_path, None, 'JSNice Beautifier fail')
    
        ok = clear.run(temp_files['path_tmp_unugly_2'], 
                       temp_files['path_unugly'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')


        try:
            lexer = Lexer(temp_files['path_unugly'])
            iBuilder = IndexBuilder(lexer.tokenList)
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'IndexBuilder fail')
        
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 temp_files['path_unugly']))
            nameOrigin = scopeAnalyst.nameOrigin
            isGlobal = scopeAnalyst.isGlobal
            
            for (name, def_scope) in nameOrigin.iterkeys():
                
                pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
                (lin,col) = iBuilder.revFlatMat[pos]
                (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
                
                candidates.append(('Nice2Predict', def_scope, 
                                   tok_lin, tok_col, 
                                   isGlobal.get((name, pos), True),
                                   name, '',''))
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'ScopeAnalyst fail')
    
    
    
        # Run the JSNice from http://www.jsnice.org
        jsNice = JSNice()
        (ok, _out, _err) = jsNice.run(temp_files['path_tmp_u_a'], 
                                      temp_files['path_tmp_jsnice'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'JSNice fail')

        ok = clear.run(temp_files['path_tmp_jsnice'], 
                       temp_files['path_jsnice'])
        if not ok:
            cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
        
        try:
            lexer = Lexer(temp_files['path_jsnice'])
            iBuilder = IndexBuilder(lexer.tokenList)
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'IndexBuilder fail')
        
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 temp_files['path_jsnice']))
            nameOrigin = scopeAnalyst.nameOrigin
            isGlobal = scopeAnalyst.isGlobal
            
            for (name, def_scope) in nameOrigin.iterkeys():
                
                pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
                (lin,col) = iBuilder.revFlatMat[pos]
                (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
                
                candidates.append(('JSNice', def_scope, 
                                   tok_lin, tok_col, 
                                   isGlobal.get((name, pos), True),
                                   name, '',''))
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'ScopeAnalyst fail')
        
        
        
        
        # Compute scoping: name2scope is a dictionary where keys
        # are (name, start_index) tuples and values are scope identifiers. 
        # Note: start_index is a flat (unidimensional) index, 
        # not a (line_chr_idx, col_chr_idx) index.
        try:
            scopeAnalyst = ScopeAnalyst(os.path.join(
                                 os.path.dirname(os.path.realpath(__file__)), 
                                 temp_files['path_tmp_u_a']))
        except:
            cleanup(temp_files)
            return (js_file_path, None, 'ScopeAnalyst fail')
         
         
 
        # Baseline translation: No renaming, no scoping
        no_renaming = []
        for _line_idx, line in enumerate(iBuilder_ugly.tokens):
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
         
        with open(temp_files['f2'], 'w') as f_no_renaming:
            f_no_renaming.writelines(no_renaming)
         
        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
                           'train.no_renaming', 'tuning', 'moses.ini'))
        (_moses_ok, translation, _err) = moses.run(temp_files['f2'])
 
        nc = processTranslationUnscoped(translation, iBuilder_ugly, 
                       lm_path, temp_files['f2'],
                       output_path, base_name)
        if nc:
            candidates += nc
                     
#  translation, iBuilder, lm_path, 
#                                f_path, output_path, base_name       
        # Default translation: No renaming
#         no_renaming = []
#         for _line_idx, line in enumerate(iBuilder_ugly.tokens):
#             no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
#         
#         with open(temp_files['f2'], 'w') as f_no_renaming:
#             f_no_renaming.writelines(no_renaming)
#         
#         moses = MosesDecoder(ini_path=os.path.join(ini_path, \
#                            'train.no_renaming', 'tuning', 'moses.ini'))
#         (_moses_ok, translation, _err) = moses.run(temp_files['f2'])
 
        nc = processTranslationScoped(translation, iBuilder_ugly, 
                       scopeAnalyst, lm_path, temp_files['f2'],
                       output_path, base_name)
        if nc:
            candidates += nc
         
         
         
        # More complicated renaming: collect the context around  
        # each name (global variables, API calls, punctuation)
        # and build a hash of the concatenation.        
        hash_def_one_renaming = renameUsingHashDefLine(scopeAnalyst, 
                                                   iBuilder_ugly, 
                                                   twoLines=False,
                                                   debug=False)
        with open(temp_files['f5'], 'w') as f_hash_def_one_renaming:
            f_hash_def_one_renaming.writelines(hash_def_one_renaming)
 
        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
                           'train.hash_def_one_renaming', 'tuning', 'moses.ini'))
        (_moses_ok, translation, _err) = moses.run(temp_files['f5'])
         
        nc = processTranslationScoped(translation, iBuilder_ugly, 
                       scopeAnalyst, lm_path, temp_files['f5'], 
                       output_path, base_name)
        if nc:
            candidates += nc
            
            
        
        cleanup(temp_files)
        cleanupRenamed(pid)
        return (js_file_path, 'OK', candidates)


    except Exception, e:
        cleanup(temp_files)
        cleanupRenamed(pid)
        return (js_file_path, None, str(e).replace("\n", ""))
    
    
    
corpus_root = os.path.abspath(sys.argv[1])
testing_sample_path = os.path.abspath(sys.argv[2])

output_path = Folder(sys.argv[3]).create()
num_threads = int(sys.argv[4])
ini_path = os.path.abspath(sys.argv[5])
lm_path = os.path.abspath(sys.argv[6])

flog = 'log_test_' + os.path.basename(corpus_root)
c_path = 'candidates.csv'
#f1, f2, f3, f4, f5, f6, 
try:
    for f in [flog, c_path]:
        os.remove(os.path.join(output_path, f))
except:
    pass


# inputs = Folder(corpus_root).fullFileNames("*.js")

with open(testing_sample_path, 'r') as f:

    reader = UnicodeReader(f)

#     result = processFile(reader.next())

    pool = multiprocessing.Pool(processes=num_threads)
    
    for result in pool.imap_unordered(processFile, reader):
#     if True:
    
        with open(os.path.join(output_path, flog), 'a') as g, \
                open(os.path.join(output_path, c_path), 'a') as c:
            writer = UnicodeWriter(g)
            cw = UnicodeWriter(c)
     
            if result[1] is not None:
                js_file_path, ok, candidates = result
                writer.writerow([js_file_path, ok])
                for r in candidates:
                    cw.writerow([js_file_path]+
                                [str(x).replace("\"","") for x in list(r)])
            else:
                writer.writerow([result[0], result[2]])
             

