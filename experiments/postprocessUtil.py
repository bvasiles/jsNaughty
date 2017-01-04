'''
Created on Aug 21, 2016

    - Copied postprocessing functions from Bogdan's runSimplifiedExperiment 
    to reference them from other files.
'''
import re
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))

from tools import  IndexBuilder, prepHelpers, MosesParser, \
                    Beautifier, Lexer, ScopeAnalyst, \
                    UnuglifyJS, JSNice, LMQuery, MosesDecoder, \
                    TranslationSummarizer, ConsistencyResolver

from renamingStrategies import renameUsingHashDefLine

from folderManager import Folder
from pygments.token import Token, is_token_subtype
from copy import deepcopy


# 
# def tryRemove(pth):
#     try:
#         os.remove(pth)
#     except OSError:
#         pass
# 
#     
# def cleanup(temp_files):
#     for file_path in temp_files: #.itervalues():
#         tryRemove(file_path)
# 
# 
# def cleanupRenamed(pid):
#     for strategy in ['js', 'lm.js', 'len.js', 'freqlen.js',
#                      'unscoped.lm.js', 'unscoped.len.js', 
#                      'unscoped.freqlen.js']:
#         tryRemove('tmp_%d.no_renaming.%s' % (pid, strategy))
# #         tryRemove('tmp_%d.basic_renaming.%s' % (pid, strategy))
# #         tryRemove('tmp_%d.hash_renaming.%s' % (pid, strategy))
#         tryRemove('tmp_%d.hash_def_one_renaming.%s' % (pid, strategy))
# #         tryRemove('tmp_%d.hash_def_two_renaming.%s' % (pid, strategy))
#     
# 
# 
# 
# def writeTmpLines(lines, 
#                   out_file_path):
#     
#     js_tmp = open(out_file_path, 'w')
#     js_tmp.write('\n'.join([' '.join([token for (_token_type, token) in line]) 
#                             for line in lines]).encode('utf8'))
#     js_tmp.write('\n')
#     js_tmp.close()
# 
# 
# 
# def prepareHelpers(iBuilder, 
#                    scopeAnalyst=None):
#     '''
#     Collect names and their locations in various formats
#     that will come in handy later.
#     '''
#     
#     # Which locations [(line number, index within line)] does
#     # a variable name appear at?
#     name_positions = {}
#     
#     # Which variable name is at a location specified by 
#     # [line number][index within line]?
#     position_names = {}
#     
#     for line_num, line in enumerate(iBuilder.tokens):
#         position_names.setdefault(line_num, {})
#         
#         for line_idx, (token_type, token) in enumerate(line):
#             
#             if is_token_subtype(token_type, Token.Name):
#                 (l,c) = iBuilder.tokMap[(line_num, line_idx)]
#                 p = iBuilder.flatMap[(l,c)]
#                 
# #                 cond = False
#                 if scopeAnalyst is not None:
#                     name2defScope = scopeAnalyst.resolve_scope()
# #                     isGlobal = scopeAnalyst.isGlobal
#             
# #                     if not False: #isGlobal.get((token, p), True):
#                     try:
#                         def_scope = name2defScope[(token, p)]
#                         
#                         name_positions.setdefault((token, def_scope), [])
#                         name_positions[(token, def_scope)].append((line_num, line_idx))
#                         
#                         position_names[line_num][line_idx] = (token, def_scope)
#                         
#                     except KeyError:
#                         pass
# 
# #                         cond = True
# # #                         print (token, def_scope), line_num, line_idx
#                 
#                 else:
#                     def_scope = None
#                 
#                     name_positions.setdefault((token, def_scope), [])
#                     name_positions[(token, def_scope)].append((line_num, line_idx))
#                     
#                     position_names[line_num][line_idx] = (token, def_scope)
# 
# #                     cond = True
# #                 if cond:
# #                     print (token, def_scope), line_num, line_idx
#                 
# 
#     return (name_positions, position_names)
#                 
# 
# 
# def parseMosesOutput(moses_output, 
#                      iBuilder,
#                      position_names):
#         
#     name_candidates = {}
#     print(iBuilder.tokens)
#         
#     for line in moses_output.split('\n'):
#         print(line)
#         translations = {}
#         
#         parts = line.split('|||')
#         if not len(parts[0]):
#             continue
# 
#         # The index of the line in the input to which this
#         # translated line corresponds, starting at 0:
#         n = int(parts[0])
# 
#         # The translation:
#         translation = parts[1].strip()
#         translation_parts = translation.split(' ')
# 
#         # Only keep translations that have exactly the same 
#         # number of tokens as the input
#         # If the translation has more tokens, copy the input
#         if len(translation_parts) != len(iBuilder.tokens[n]):
#             translation_parts = [token for (_token_type, token) \
#                                     in iBuilder.tokens[n]]
#             translation = ' '.join(translation_parts)
#         
#         # An input can have identical translations, but with
#         # different scores (the number of different translations
#         # per input is controlled by the -n-best-list decoder
#         # parameter). Keep only unique translations.
#         translations.setdefault(n, set([]))
#         translations[n].add(translation)
#        
#         # Which within-line indices have non-global var names? 
#         line_dict = position_names.get(n, {})
#         
#         # For each variable name, record its candidate translation
#         # and on how many lines (among the -n-best-list) it appears on
#         for line_idx in line_dict.keys():
#             
#             # The original variable name
#             k = line_dict[line_idx]
#             
#             # The translated variable name
#             name_translation = translation_parts[line_idx]
#             
#             # Record the line number (we will give more weight
#             # to names that appear on many translation lines) 
#             name_candidates.setdefault(k, {})
#             name_candidates[k].setdefault(name_translation, set([]))
#             name_candidates[k][name_translation].add(n) 
#                 
#     return name_candidates
# 
# 
# 
# def isHash(candidate_name):
#     # _5a1652ee 
#     return candidate_name[0] == '_' and \
#         len(candidate_name) == 9 and \
#         re.match(r'(?:[a-z0-9]+)$', candidate_name[1:])
#         
# 

# 
# 
# 

# 
#      
# 
# def rename(iBuilder, name_positions, renaming_map):
#     draft_translation = deepcopy(iBuilder.tokens)
#     
#     for (name, def_scope), renaming in renaming_map.iteritems():
#         for (line_num, line_idx) in name_positions[(name, def_scope)]:
#             (token_type, name) = draft_translation[line_num][line_idx]
#             draft_translation[line_num][line_idx] = (token_type, renaming)
# 
#     return draft_translation
# 
# 
# def renameIfNotHash(iBuilder, name_positions, renaming_map):
#     draft_translation = deepcopy(iBuilder.tokens)
#     
#     for (name, def_scope), renaming in renaming_map.iteritems():
#         for (line_num, line_idx) in name_positions[(name, def_scope)]:
#             (token_type, name) = draft_translation[line_num][line_idx]
#             if not isHash(renaming):
#                 draft_translation[line_num][line_idx] = (token_type, renaming)
#             else:
#                 draft_translation[line_num][line_idx] = (token_type, name)
# 
#     return draft_translation
# 
# 
# 
# def summarizeScopedTranslation(renaming_map,
#                                f_path,
#                                translation_strategy,
#                                output_path,
#                                base_name,
#                                name_candidates,
#                                name_positions,
#                                iBuilder,
#                                scopeAnalyst):
# 
#     nc = []
#         
#     f_base = os.path.basename(f_path)
#     training_strategy = f_base.split('.')[1]
#     tmp_path = '%s.%s.js' % (f_base[:-3], translation_strategy)
#     o_path = '%s.%s.%s.js' % (base_name, training_strategy, translation_strategy)
#     
# #     print f_path, f_base, training_strategy, tmp_path, o_path, base_name
#     
#     isGlobal = scopeAnalyst.isGlobal
#     
#     for (name, def_scope), renaming in renaming_map.iteritems():
#             
#         pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
#             
#         (lin,col) = iBuilder.revFlatMat[pos]
#         (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
#         
#         nc.append( ('%s.%s' % (training_strategy, translation_strategy), 
#                     def_scope, 
#                     tok_lin, tok_col, 
#                     isGlobal.get((name, pos), True),
#                     renaming,
#                     ','.join(name_candidates[(name, def_scope)])) )
#     
#     writeTmpLines(rename(iBuilder, name_positions, renaming_map), tmp_path)
#     
#     clear = Beautifier()
#     ok = clear.run(tmp_path, os.path.join(output_path, o_path))
#     if not ok:
#         return False
#     return nc


# 
# def summarizeUnscopedTranslation(renaming_map,
#                                f_path,
#                                translation_strategy,
#                                output_path,
#                                base_name,
#                                name_candidates,
#                                name_positions,
#                                iBuilder):
# 
#     nc = []
#     
#     f_base = os.path.basename(f_path)
#     training_strategy = f_base.split('.')[1]
#     tmp_path = '%s.%s.js' % (f_base[:-3], translation_strategy)
#     o_path = '%s.%s.unscoped.%s.js' % (base_name, training_strategy, translation_strategy)
#     
# #     print f_path, f_base, training_strategy, tmp_path, o_path, base_name
#     
#     writeTmpLines(rename(iBuilder, name_positions, renaming_map), tmp_path)
#     
#     clear = Beautifier()
#     ok = clear.run(tmp_path, os.path.join(output_path, o_path))
#     if not ok:
#         return False
#     
#     try:
#         lexer = Lexer(os.path.join(output_path, o_path))
#         iBuilder_local = IndexBuilder(lexer.tokenList)
#     
#         scopeAnalyst_local = ScopeAnalyst(os.path.join(output_path, o_path))
#     except:
#         return False
#     
#     nameOrigin = scopeAnalyst_local.nameOrigin
#     isGlobal = scopeAnalyst_local.isGlobal
#      
#     for (name, def_scope) in nameOrigin.iterkeys():
#         
#         pos = scopeAnalyst_local.nameDefScope2pos[(name, def_scope)]
#         
#         if not False: #isGlobal.get((name, pos), True):
#             (lin,col) = iBuilder_local.revFlatMat[pos]
#             (tok_lin, tok_col) = iBuilder_local.revTokMap[(lin,col)]
#     
#             nc.append( ('%s.unscoped.%s' % (training_strategy, translation_strategy), 
#                     def_scope, 
#                     tok_lin, tok_col, 
#                     isGlobal.get((name, pos), True),
#                     name,
#                     '','') )
#             
#     return nc
#     


def processTranslationScoped(translation, 
                             iBuilder, 
                             scopeAnalyst, 
                             lm_path):
    
    nc = []
    
    if translation is not None:

        (name_positions, 
         position_names) = prepHelpers(iBuilder, scopeAnalyst)
        
        # Parse moses output
        mp = MosesParser()
        
        name_candidates = mp.parse(translation,
                                   iBuilder,
                                   position_names)
        # name_candidates is a dictionary of dictionaries: 
        # keys are (name, None) (if scopeAnalyst=None) or 
        # (name, def_scope) tuples (otherwise); 
        # values are suggested translations with the sets 
        # of line numbers on which they appear.
        
        print 'name_candidates\n', name_candidates
        
        ts = TranslationSummarizer()
        cs = ConsistencyResolver()
        
        renaming_map = cs.computeLMRenaming(name_candidates,
                                                         name_positions,
                                                         iBuilder,
                                                         lm_path)
        print '\nrenaming_map\n', renaming_map

        r = ts.compute_summary_scoped(renaming_map,
                                       name_candidates,
                                       iBuilder,
                                       scopeAnalyst,
                                       'lm')
        print 'Done: ts.compute_summary_scoped(cs.computeLMRenaming(...))'
        
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
        
        
        r = ts.compute_summary_scoped(cs.computeFreqLenRenaming(name_candidates,
                                                              name_positions,
                                                              lambda e:(-e[1],-len(e[0]))),
                                       name_candidates,
                                       iBuilder,
                                       scopeAnalyst,
                                       'freqlen')
        print 'Done: ts.compute_summary_scoped(cs.computeFreqLenRenaming(...))'
        if not r:
            return False
        nc += r
        

    return nc



def processTranslationUnscoped(translation, iBuilder, lm_path, 
                               f_path, output_path, base_name):
    
    nc = []
    
    if translation is not None:

        (name_positions, 
         position_names) = prepHelpers(iBuilder, None)
        
        # Parse moses output
        mp = MosesParser()
        
        name_candidates = mp.parse(translation,
                                   iBuilder,
                                   position_names)
        # name_candidates is a dictionary of dictionaries: 
        # keys are (name, None) (if scopeAnalyst=None) or 
        # (name, def_scope) tuples (otherwise); 
        # values are suggested translations with the sets 
        # of line numbers on which they appear.
        
        ts = TranslationSummarizer()
        cs = ConsistencyResolver()
        
        ts = TranslationSummarizer()
        nc = ts.compute_summary_unscoped(iBuilder, scopeAnalyst, prefix)

        r = ts.compute_summary_unscoped(cs.computeLMRenaming(name_candidates,
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
        
        r = ts.compute_summary_unscoped(cs.computeFreqLenRenaming(name_candidates,
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



def processTranslationScopedServer(translation, 
                                   iBuilder, 
                                   scopeAnalyst, 
                                   lm_path):
    
#     nc = []
    
    renaming_map = {}
    
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
        
        renaming_map = computeFreqLenRenaming(name_candidates,
                                              name_positions,
                                              lambda e:(-e[1],-len(e[0])))
        # renaming_map is a dictionary that maps tuples 
        # (name, def_scope) to renamings
        
    return renameIfNotHash(iBuilder, name_positions, renaming_map)
        
#         r = summarizeScopedTranslation(renaming_map,
#                                        f_path,
#                                        'freqlen',
#                                        output_path,
#                                        base_name,
#                                        name_candidates,
#                                        name_positions,
#                                        iBuilder,
#                                        scopeAnalyst)
#         if not r:
#             return False
#         nc += r
    
    
#     nc = []
#         
#     f_base = os.path.basename(f_path)
#     training_strategy = f_base.split('.')[1]
#     tmp_path = '%s.%s.js' % (f_base[:-3], translation_strategy)
#     o_path = '%s.%s.%s.js' % (base_name, training_strategy, translation_strategy)
    
#     print f_path, f_base, training_strategy, tmp_path, o_path, base_name
    
#     isGlobal = scopeAnalyst.isGlobal
#     
#     for (name, def_scope), renaming in renaming_map.iteritems():
#             
#         pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
#             
#         (lin,col) = iBuilder.revFlatMat[pos]
#         (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
#         
#         nc.append( ('%s.%s' % (training_strategy, translation_strategy), 
#                     def_scope, 
#                     tok_lin, tok_col, 
#                     isGlobal.get((name, pos), True),
#                     renaming,
#                     ','.join(name_candidates[(name, def_scope)])) )
    
#     writeTmpLines(renameIfNotHash(iBuilder, name_positions, renaming_map), tmp_path)
#     
#     clear = Beautifier()
#     ok = clear.run(tmp_path, os.path.join(output_path, o_path))
#     if not ok:
#         return False
#     return nc
#     
# 
#     return nc

