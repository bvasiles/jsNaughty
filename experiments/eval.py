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
from tools import Uglifier, Preprocessor, IndexBuilder, \
                    Beautifier, Lexer, Aligner, ScopeAnalyst, \
                    UnuglifyJS, JSNice, LMQuery, MosesDecoder, \
                    prepHelpers, TranslationSummarizer, WebMosesDecoder, \
                    WebMosesOutputFormatter, WebScopeAnalyst, \
                    WebPreprocessor, Postprocessor, WebLexer, \
                    MosesParser, ConsistencyResolver, PreRenamer, PostRenamer

# from renamingStrategies import renameUsingHashDefLine

from folderManager import Folder
from pygments.token import Token, is_token_subtype
from copy import deepcopy

import xmlrpclib
from postprocessUtil import processTranslationScoped, processTranslationUnscoped




def tryRemove(pth):
    try:
        os.remove(pth)
    except OSError:
        pass
 
     
def cleanup(temp_files):
    for file_path in temp_files: #.itervalues():
        tryRemove(file_path)


# def cleanupRenamed(pid):
#     for strategy in ['js', 'lm.js', 'len.js', 'freqlen.js',
#                      'unscoped.lm.js', 'unscoped.len.js', 
#                      'unscoped.freqlen.js']:
#         tryRemove('tmp_%d.no_renaming.%s' % (pid, strategy))
# #         tryRemove('tmp_%d.basic_renaming.%s' % (pid, strategy))
# #         tryRemove('tmp_%d.hash_renaming.%s' % (pid, strategy))
#         tryRemove('tmp_%d.hash_def_one_renaming.%s' % (pid, strategy))
#         tryRemove('tmp_%d.hash_def_two_renaming.%s' % (pid, strategy))
    



# def computeLMRenaming(name_candidates, 
#                       name_positions,
#                       iBuilder, 
#                       lm_path):
#     
#     renaming_map = {}
#     seen = {}
#     
#     # There is no uncertainty about the translation for
#     # identifiers that have a single candidate translation
#     
#     for key, val in name_candidates.iteritems():
#         for use_scope, suggestions in val.iteritems():
#             
#             if len(suggestions.keys()) == 1:
#                 
#                 candidate_name = suggestions.keys()[0]
#                 
#                 (name, def_scope) = key
#                 
#                 if not seen.has_key((candidate_name, use_scope)):
# #                     print (key, use_scope), candidate_name
#                     renaming_map[(key, use_scope)] = candidate_name
#                     seen[(candidate_name, use_scope)] = True
#                 else:
# #                     print (key, use_scope), name
# #                     if seen[(name, use_scope)]:
# #                         print (name, use_scope), candidate_name
#                     renaming_map[(key, use_scope)] = name
#                     seen[(name, use_scope)] = True
#                     # You can still get screwed here if name
#                     # was the suggestion for something else 
#                     # in this scope earlier. Ignoring for now
# 
#     
#     # For the remaining identifiers, choose the translation that 
#     # gives the highest language model log probability
#     
#     token_lines = []
#     
#     for key, pos in name_positions.iteritems():
#         token_lines.append((key, \
#                             len(set([line_num \
#                                  for (line_num, _line_idx) in pos]))))
#         
#     # Sort names by how many lines they appear 
#     # on in the input, descending
#     token_lines = sorted(token_lines, key=lambda e: -e[1])
# #     print token_lines
#     
#     for key, _num_lines in token_lines:
#         
#         for use_scope, suggestions in name_candidates[key].iteritems():
# #             suggestions[name_translation] = set([line numbers])
#         
#             # Sort candidates by how many lines in the translation
#             # they appear on, and by name length, both descending
#             candidates = sorted([(name_translation, len(line_nums)) \
#                                  for (name_translation, line_nums) \
#                                  in suggestions.items()], 
#                                 key=lambda e:(-e[1],-len(e[0])))
#         
#             if len(candidates) > 1:
#     
#                 log_probs = []
#                 
#                 (name, def_scope) = key
#                 unseen_candidates = [candidate_name 
#                                      for (candidate_name, _occurs) in candidates
#                                      if not seen.has_key((candidate_name, use_scope))]
#                 
#                 if len(unseen_candidates):
#                     
#                     for candidate_name in unseen_candidates:
#                         line_nums = set([num \
#                             for (num,idx) in name_positions[key]])
#                         
#                         draft_lines = []
#                         
#                         for line_num in line_nums:
#                             draft_line = [token for (_token_type, token) 
#                                           in iBuilder.tokens[line_num]]
#                             for line_idx in [idx 
#                                              for (num, idx) in name_positions[key] 
#                                              if num == line_num]:
#                                 draft_line[line_idx] = candidate_name
#                                 
#                             draft_lines.append(' '.join(draft_line))
#                             
#                             
#                         line_log_probs = []
#                         for line in draft_lines:
#                             lmquery = LMQuery(lm_path=lm_path)
#                             (lm_ok, lm_log_prob, _lm_err) = lmquery.run(line)
#                             
#                             if not lm_ok:
#                                 lm_log_prob = -9999999999
#                             line_log_probs.append(lm_log_prob)
#     
#                         if not len(line_log_probs):
#                             lm_log_prob = -9999999999
#                         else:
#                             lm_log_prob = float(sum(line_log_probs)/len(line_log_probs))
#         
#                         log_probs.append((candidate_name, lm_log_prob))
#                     
#                     candidate_names = sorted(log_probs, key=lambda e:-e[1])
#                     candidate_name = candidate_names[0][0]
#                     
# #                     print (key, use_scope), candidate_name
#                     renaming_map[(key, use_scope)] = candidate_name
#                     seen[(candidate_name, use_scope)] = True
#                     
#                 else:
# #                     if seen[(name, use_scope)]:
# #                         print (name, use_scope), candidate_name
#                     
# #                     print (key, use_scope), name
#                     renaming_map[(key, use_scope)] = name
#                     seen[(name, use_scope)] = True
#     
# #     print '\n\n'
#     return renaming_map
#     
#     
# #     for (key, val) in [(key, val) 
# #                  for key, val in name_candidates.items() 
# #                  if len(val.keys()) == 1]:
# #                      
# #         (name, def_scope) = key
# # #         ((name, def_scope), use_scope) = key
# #         
# #         
# #         candidate_name = val.keys()[0]
# #         
# #         if not seen.has_key((candidate_name, use_scope)):
# #             renaming_map[key] = candidate_name
# #             seen[(candidate_name, use_scope)] = True
# #             
# #         else:
# #             renaming_map[(name, use_scope)] = name
# #         
# #     # For the remaining variables, choose the translation that 
# #     # gives the highest language model log probability
# #     
# #     token_lines = []
# #     
# #     for key, pos in name_positions.iteritems():
# #         token_lines.append((key, \
# #                             len(set([line_num \
# #                                  for (line_num, _line_idx) in pos]))))
# #         
# #     # Sort names by how many lines they appear 
# #     # on in the input, descending
# #     token_lines = sorted(token_lines, key=lambda e: -e[1])
# # #     print token_lines
# #     
# #     for key, _num_lines in token_lines:
# #         # Sort candidates by how many lines in the translation
# #         # they appear on, and by name length, both descending
# #         candidates = sorted([(name_translation, len(line_nums)) \
# #                              for (name_translation, line_nums) \
# #                              in name_candidates[key].items()], 
# #                             key=lambda e:(-e[1],-len(e[0])))
# #         
# #         if len(candidates) > 1:
# # 
# #             log_probs = []
# #             
# #             (name, def_scope) = key
# #             unseen_candidates = [candidate_name 
# #                                  for (candidate_name, _occurs) in candidates
# #                                  if not seen.has_key((candidate_name, def_scope))]
# #             
# #             if len(unseen_candidates):
# #                 
# #                 for candidate_name in unseen_candidates:
# #                     line_nums = set([num \
# #                         for (num,idx) in name_positions[key]])
# #                     
# #                     draft_lines = []
# #                     
# #                     for line_num in line_nums:
# #                         draft_line = [token for (_token_type, token) 
# #                                       in iBuilder.tokens[line_num]]
# #                         for line_idx in [idx 
# #                                          for (num, idx) in name_positions[key] 
# #                                          if num == line_num]:
# #                             draft_line[line_idx] = candidate_name
# #                             
# #                         draft_lines.append(' '.join(draft_line))
# #                         
# #                         
# #                     line_log_probs = []
# #                     for line in draft_lines:
# #                         lmquery = LMQuery(lm_path=lm_path)
# #                         (lm_ok, lm_log_prob, _lm_err) = lmquery.run(line)
# #                         
# #                         if not lm_ok:
# #                             lm_log_prob = -9999999999
# #                         line_log_probs.append(lm_log_prob)
# # 
# #                     if not len(line_log_probs):
# #                         lm_log_prob = -9999999999
# #                     else:
# #                         lm_log_prob = float(sum(line_log_probs)/len(line_log_probs))
# #     
# #                     log_probs.append((candidate_name, lm_log_prob))
# #                 
# #                 candidate_names = sorted(log_probs, key=lambda e:-e[1])
# #                 candidate_name = candidate_names[0][0]
# #                 
# #                 renaming_map[key] = candidate_name
# #                 seen[(candidate_name, def_scope)] = True
# #                 
# #             else:
# #                 renaming_map[key] = name
# #                 seen[key] = True
# #            
# #     return renaming_map

     

# def rename(iBuilder, 
#            name_positions, 
#            renaming_map):
#     
#     draft_translation = deepcopy(iBuilder.tokens)
#     
#     for (name, def_scope), renaming in renaming_map.iteritems():
#         for (line_num, line_idx) in name_positions[(name, def_scope)]:
#             (token_type, _name) = draft_translation[line_num][line_idx]
#             draft_translation[line_num][line_idx] = (token_type, renaming)
# 
#     return draft_translation



# def isHash(name):
#     # _45e4313f
#     return len(name) == 9 and name[0] == '_' and name[1:].isalnum()
 
    
# def renameHashed(iBuilder, 
#                  name_positions, 
#                  renaming_map):
#     
#     draft_translation = deepcopy(iBuilder.tokens)
#     for ((name, def_scope), use_scope), renaming in renaming_map.iteritems():
# #         print ((name, def_scope), use_scope), renaming
# #     for (name, def_scope), renaming in renaming_map.iteritems():
#         for (line_num, line_idx) in name_positions[(name, def_scope)]:
#             (token_type, _name) = draft_translation[line_num][line_idx]
# #             print (token_type, _name)
#             if not isHash(renaming):
#                 draft_translation[line_num][line_idx] = (token_type, renaming)
# 
#     return draft_translation



# def renameHashedFallback(iBuilder, 
#                          name_positions, 
#                          renaming_map, 
#                          fallback_renaming_map):
#     
#     draft_translation = deepcopy(iBuilder.tokens)
#     for (name, def_scope), renaming in renaming_map.iteritems():
#         for (line_num, line_idx) in name_positions[(name, def_scope)]:
#             (token_type, token) = draft_translation[line_num][line_idx]
#             if not isHash(renaming):
#                 draft_translation[line_num][line_idx] = (token_type, renaming)
#             else:
#                 draft_translation[line_num][line_idx] = (token_type, \
#                              fallback_renaming_map.get((name, def_scope), token))
# 
#     return draft_translation



# def summarizeFallbackTranslation(renaming_map,
#                                  fallback_renaming_map,
#                                  f_path,
#                                  translation_strategy,
#                                  output_path,
#                                  base_name,
#                                  name_candidates,
#                                  name_positions,
#                                  iBuilder,
#                                  scopeAnalyst):
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
#     writeTmpLines(renameHashedFallback(iBuilder, 
#                                        name_positions, 
#                                        renaming_map,
#                                        fallback_renaming_map), 
#                   tmp_path)
#     
#     clear = Beautifier()
#     ok = clear.run(tmp_path, os.path.join(output_path, o_path))
#     if not ok:
#         return False
#     return nc
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
#     for k, renaming in renaming_map.iteritems():
#         
# #         print k, renaming
#         
#         ((name, def_scope), use_scope) = k
#              
#         pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
#              
#         (lin,col) = iBuilder.revFlatMat[pos]
#         (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
#         
# #         print '  ', ','.join(name_candidates[(name, def_scope)][use_scope].keys())
#          
#         nc.append( ('%s.%s' % (training_strategy, translation_strategy), 
#                     def_scope, 
#                     tok_lin, tok_col, 
#                     isGlobal.get((name, pos), True),
#                     renaming,
#                     ','.join(name_candidates[(name, def_scope)][use_scope].keys())) )
#     
# #         name_candidates[k][use_scope][name_translation].add(n)
#     
# #     print '****'
#     writeTmpLines(renameHashed(iBuilder, name_positions, renaming_map), tmp_path)
#      
#     clear = Beautifier()
#     ok = clear.run(tmp_path, os.path.join(output_path, o_path))
#     if not ok:
#         return False
# 
#     return nc
# 
# 
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
#     writeTmpLines(renameHashed(iBuilder, name_positions, renaming_map), tmp_path)
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
    
    

 
# def processTranslationScopedFallback(translation, 
#                                      fallback_translation,
#                                      iBuilder, 
#                                      scopeAnalyst, 
#                                      lm_path, 
#                                      f_path,
#                                      output_path, 
#                                      base_name):
#      
#     nc = []
#     
#     if translation is not None:
#  
#         (name_positions, 
#          position_names) = prepareHelpers(iBuilder, scopeAnalyst)
#          
#         if fallback_translation is not None:
#             fallback_name_candidates = parseMosesOutput(fallback_translation,
#                                                         iBuilder,
#                                                         position_names)
#     
#             fallback_renaming_map = computeLMRenaming(fallback_name_candidates,
#                                                       name_positions,
#                                                       iBuilder,
#                                                       lm_path)
#          
#         # Parse moses output
#         name_candidates = parseMosesOutput(translation,
#                                            iBuilder,
#                                            position_names)
#         # name_candidates is a dictionary of dictionaries: 
#         # keys are (name, None) (if scopeAnalyst=None) or 
#         # (name, def_scope) tuples (otherwise); 
#         # values are suggested translations with the sets 
#         # of line numbers on which they appear.
#         
#         renaming_map = computeLMRenaming(name_candidates,
#                                          name_positions,
#                                          iBuilder,
#                                          lm_path)
#  
#         if fallback_translation is not None:
#             r = summarizeFallbackTranslation(renaming_map,
#                                              fallback_renaming_map,
#                                              f_path,
#                                              'lm',
#                                              output_path,
#                                              base_name,
#                                              name_candidates,
#                                              name_positions,
#                                              iBuilder,
#                                              scopeAnalyst)
#  
#         else:
#             r = summarizeScopedTranslation(renaming_map,
#                                            f_path,
#                                            'lm',
#                                            output_path,
#                                            base_name,
#                                            name_candidates,
#                                            name_positions,
#                                            iBuilder,
#                                            scopeAnalyst)
#         if not r:
#             return False
#         nc += r
#  
#          
# #         r = summarizeScopedTranslation(computeFreqLenRenaming(name_candidates,
# #                                                               name_positions,
# #                                                               lambda e:-len(e[0])),
# #                                        f_path,
# #                                        'len',
# #                                        output_path,
# #                                        base_name,
# #                                        name_candidates,
# #                                        name_positions,
# #                                        iBuilder,
# #                                        scopeAnalyst)
# #         if not r:
# #             return False
# #         nc += r
#         
#         
#         renaming_map = computeFreqLenRenaming(name_candidates,
#                                               name_positions,
#                                               lambda e:(-e[1],-len(e[0])))
#          
#         if fallback_translation is not None:
#             r = summarizeFallbackTranslation(renaming_map,
#                                              fallback_renaming_map,
#                                              f_path,
#                                              'freqlen',
#                                              output_path,
#                                              base_name,
#                                              name_candidates,
#                                              name_positions,
#                                              iBuilder,
#                                              scopeAnalyst)
#         
#         else:
#             r = summarizeScopedTranslation(renaming_map,
#                                            f_path,
#                                            'freqlen',
#                                            output_path,
#                                            base_name,
#                                            name_candidates,
#                                            name_positions,
#                                            iBuilder,
#                                            scopeAnalyst)
#         if not r:
#             return False
#         nc += r
#          
#  
#     return nc
# 
# 
# 
# def processTranslationScoped(translation, iBuilder, 
#                        scopeAnalyst, lm_path, f_path,
#                        output_path, base_name):
#     
#     nc = []
#     
#     if translation is not None:
# 
#         (name_positions, 
#          position_names) = prepareHelpers(iBuilder, scopeAnalyst)
#         
#         # Parse moses output
#         name_candidates = parseMosesOutput(translation,
#                                            iBuilder,
#                                            position_names,
#                                            scopeAnalyst)
#         # name_candidates is a dictionary of dictionaries: 
#         # keys are (name, None) (if scopeAnalyst=None) or 
#         # (name, def_scope) tuples (otherwise); 
#         # values are suggested translations with the sets 
#         # of line numbers on which they appear.
#         
#         renaming_map_lm = computeLMRenaming(name_candidates,
#                                          name_positions,
#                                          iBuilder,
#                                          lm_path)
# 
#         r = summarizeScopedTranslation(renaming_map_lm,
#                                        f_path,
#                                        'lm',
#                                        output_path,
#                                        base_name,
#                                        name_candidates,
#                                        name_positions,
#                                        iBuilder,
#                                        scopeAnalyst)
#         if not r:
#             return False
#         nc += r
# 
#         
# #         r = summarizeScopedTranslation(computeFreqLenRenaming(name_candidates,
# #                                                               name_positions,
# #                                                               lambda e:-len(e[0])),
# #                                        f_path,
# #                                        'len',
# #                                        output_path,
# #                                        base_name,
# #                                        name_candidates,
# #                                        name_positions,
# #                                        iBuilder,
# #                                        scopeAnalyst)
# #         if not r:
# #             return False
# #         nc += r
#         
#         
#         renaming_map_freqlen = computeFreqLenRenaming(name_candidates,
#                                                       name_positions,
#                                                       lambda e:(-e[1],-len(e[0])))
#          
#         r = summarizeScopedTranslation(renaming_map_freqlen,
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
#         
# 
#     return nc
# 
# 
# 
# def processTranslationUnscoped(translation, iBuilder, lm_path, 
#                                f_path, output_path, base_name):
#     
#     nc = []
#     
#     if translation is not None:
# 
#         (name_positions, 
#          position_names) = prepareHelpers(iBuilder, None)
#         
#         # Parse moses output
#         name_candidates = parseMosesOutput(translation,
#                                            iBuilder,
#                                            position_names)
# 
#         renaming_map_lm = computeLMRenaming(name_candidates,
#                                              name_positions,
#                                              iBuilder,
#                                              lm_path)
#         
#         r = summarizeUnscopedTranslation(renaming_map_lm,
#                                        f_path,
#                                        'lm',
#                                        output_path,
#                                        base_name,
#                                        name_candidates,
#                                        name_positions,
#                                        iBuilder)
#         if not r:
#             return False
#         nc += r
# 
#         
# #         r = summarizeUnscopedTranslation(computeFreqLenRenaming(name_candidates,
# #                                                               name_positions,
# #                                                               lambda e:-len(e[0])),
# #                                        f_path,
# #                                        'len',
# #                                        output_path,
# #                                        base_name,
# #                                        name_candidates,
# #                                        name_positions,
# #                                        iBuilder)
# #         if not r:
# #             return False
# #         nc += r
#         
#         renaming_map_freqlen = computeFreqLenRenaming(name_candidates,
#                                                       name_positions,
#                                                       lambda e:(-e[1],-len(e[0])))
#         
#         r = summarizeUnscopedTranslation(renaming_map_freqlen,
#                                        f_path,
#                                        'freqlen',
#                                        output_path,
#                                        base_name,
#                                        name_candidates,
#                                        name_positions,
#                                        iBuilder)
#         if not r:
#             return False
#         nc += r
#         
# 
#     return nc


                


def processFile(l):
    
    js_file_path = l[0]
    base_name = os.path.splitext(os.path.basename(js_file_path))[0]
    
#     pid = int(multiprocessing.current_process().ident)
    
    print js_file_path
    
#     temp_files = {'minified': 'tmp_%d.u.js' % pid,
#                   'n2p': 'tmp_%d.n2p.js' % pid}
    temp_files = {'minified': '%s.u.js' % base_name,
                  'n2p': '%s.n2p.js' % base_name}
    
    for r_strategy in renaming_strategies.keys():
        temp_files['%s' % (r_strategy)] = \
                    '%s.%s.js' % (base_name, r_strategy)
                    
        for c_strategy in consistency_strategies:
            temp_files['%s_%s' % (r_strategy, c_strategy)] = \
                    '%s.%s.%s.js' % (base_name, r_strategy, c_strategy)
                    
#             temp_files['%s_%s' % (renaming, strategy)] = \
#                     'tmp_%d.%s.%s' % (pid, renaming, strategy)
    
    for k,v in temp_files.iteritems():
        temp_files[k] = os.path.join(output_path, v)
    
    
#                   'no_renaming': 'tmp_%d.no_renaming.js' % pid,
#                   'basic_renaming': 'tmp_%d.basic_renaming.js' % pid,
#                   'normalized': 'tmp_%d.normalized.js' % pid,
#                   'hash_one': 'tmp_%d.hash_def_one_renaming.js' % pid,
#                   'hash_two': 'tmp_%d.hash_def_two_renaming.js' % pid}
 

#     temp_files = {'path_tmp': 'tmp_%d.js' % pid,
#                   'path_tmp_b': 'tmp_%d.b.js' % pid,
#                   'path_tmp_b_1': 'tmp_%d.b.1.js' % pid,
#                   'path_tmp_b_2': 'tmp_%d.b.2.js' % pid,
#                   'path_tmp_b_a': 'tmp_%d.b.a.js' % pid,
#                   'path_tmp_u': 'tmp_%d.u.js' % pid,
#                   'path_tmp_u_a': 'tmp_%d.u.a.js' % pid,
#                   'path_tmp_unugly': 'tmp_%d.n2p.js' % pid,
#                   'path_tmp_unugly_1': 'tmp_%d.n2p.1.js' % pid,
#                   'path_tmp_unugly_2': 'tmp_%d.n2p.2.js' % pid,
#                   'path_tmp_jsnice': 'tmp_%d.jsnice.js' % pid,
#                   'f2': 'tmp_%d.no_renaming.js' % pid,
# #                   'f3': 'tmp_%d.basic_renaming.js' % pid,
# #                   'f4': 'tmp_%d.hash_renaming.js' % pid,
#                   'f5': 'tmp_%d.hash_def_one_renaming.js' % pid,
#                   'f6': 'tmp_%d.hash_def_two_renaming.js' % pid,
#                   'f7': 'tmp_%d.hash_def_one_renaming_fb.js' % pid,
#                   'path_orig': os.path.join(output_path, 
#                                             '%s.js' % base_name),
#                   'path_ugly': os.path.join(output_path, 
#                                             '%s.u.js' % base_name),
#                   'path_unugly': os.path.join(output_path, 
#                                               '%s.n2p.js' % base_name),
#                   'path_jsnice': os.path.join(output_path, 
#                                               '%s.jsnice.js' % base_name)}
    


    candidates = []
    
#     if True:
    try:
        js_text = open(os.path.join(corpus_root, js_file_path), 'r').read()
        
        # Strip comments, replace literals, etc
        try:
            prepro = WebPreprocessor(js_text)
            prepro_text = str(prepro)
#             prepro.write_temp_file(temp_files['path_tmp'])
        except:
#             cleanup(temp_files)
            return (js_file_path, None, 'Preprocessor fail')
        
        
        # Pass through beautifier to fix layout
        clear = Beautifier()
        (ok, beautified_text, _err) = clear.web_run(prepro_text)
        if not ok:
#             cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
        
            
#         # Pass through beautifier to fix layout
#         clear = Beautifier()
#         ok = clear.run(temp_files['path_tmp'], 
#                        temp_files['path_tmp_b_1'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Beautifier fail')
#          
#         jsNiceBeautifier = JSNice(flags=['--no-types', '--no-rename'])
#         
#         (ok, _out, _err) = jsNiceBeautifier.run(temp_files['path_tmp_b_1'], 
#                                                 temp_files['path_tmp_b_2'])
#         if not ok:
#             cleanup(temp_files)
#             print js_file_path, _err
#             return (js_file_path, None, 'JSNice Beautifier fail')
# 
#         ok = clear.run(temp_files['path_tmp_b_2'], 
#                        temp_files['path_tmp_b'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Beautifier fail')
#          
#          
#         # Weird JSNice renamings despite --no-rename
#         try:
#             before = set([token for (token, token_type) in 
#                           Lexer(temp_files['path_tmp_b_1']).tokenList
#                           if is_token_subtype(token_type, Token.Name)]) 
#             after = set([token for (token, token_type) in 
#                           Lexer(temp_files['path_tmp_b']).tokenList
#                           if is_token_subtype(token_type, Token.Name)])
#             
#             if not before == after:
#                 return (js_file_path, None, 'Weird JSNice renaming')
#             
#         except:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Lexer fail')
         
         
        # Minify
        ugly = Uglifier()
        (ok, minified_text, _err) = ugly.web_run(beautified_text)
        if not ok:
#             cleanup(temp_files)
            return (js_file_path, None, 'Uglifier fail')
        
        # Num tokens before vs after
        try:
            lex_clear = WebLexer(beautified_text)
            tok_clear = lex_clear.tokenList
            
            lex_ugly = WebLexer(minified_text)
            tok_ugly = lex_ugly.tokenList
        except:
#             cleanup(temp_files)
            return (js_file_path, None, 'Lexer fail')
       
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(tok_clear) == len(tok_ugly):
#             cleanup(temp_files)
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
#             cleanup(temp_files)
            return (js_file_path, None, 'Not minified')

        
        try:
#             lex_ugly = Lexer(temp_files['path_tmp_u_a'])
            iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        except:
#             cleanup(temp_files)
            return (js_file_path, None, 'IndexBuilder fail')
        
        
        with open(temp_files['minified'], 'w') as f:
            f.write(minified_text)
        
#         # Store original and uglified versions
#         ok = clear.run(temp_files['path_tmp_b_a'], 
#                        temp_files['path_orig'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Beautifier fail')
#          
#         ok = clear.run(temp_files['path_tmp_u_a'], 
#                        temp_files['path_ugly'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Beautifier fail')
        
        ######################## 
        #     Nice2Predict
        ########################
        
        # BV: Next block left out until I figure out the pipe issue
        # BV: Update: I couldn't pipe input to N2P. TODO: FIX
        # Run the JSNice from http://www.nice2predict.org
        unuglifyJS = UnuglifyJS()
        (ok, n2p_text, _err) = unuglifyJS.run(temp_files['minified'])
        if not ok:
#             cleanup(temp_files)
            return (js_file_path, None, 'Nice2Predict fail')
# 
#         
        (ok, n2p_text_beautified, _err) = clear.web_run(n2p_text)
        if not ok:
#             cleanup(temp_files)
            return (js_file_path, None, 'Beautifier fail')
        
        with open(temp_files['n2p'], 'w') as f:
            f.write(n2p_text_beautified)
         
         
# #         ok = clear.run(temp_files['path_tmp_unugly'], 
# #                        temp_files['path_tmp_unugly_1'])
# #         if not ok:
# #             cleanup(temp_files)
# #             return (js_file_path, None, 'Beautifier fail')
# #         
# #         (ok, _out, _err) = jsNiceBeautifier.run(temp_files['path_tmp_unugly_1'], 
# #                                                 temp_files['path_tmp_unugly_2'])
# #         if not ok:
# #             cleanup(temp_files)
# #             print js_file_path, _err
# #             return (js_file_path, None, 'JSNice Beautifier fail')
# #     
# #         ok = clear.run(temp_files['path_tmp_unugly_2'], 
# #                        temp_files['path_unugly'])
# #         if not ok:
# #             cleanup(temp_files)
# #             return (js_file_path, None, 'Beautifier fail')
# 
# 
        try:
            n2p_lexer = WebLexer(n2p_text_beautified)
            n2p_iBuilder = IndexBuilder(n2p_lexer.tokenList)
            n2p_scopeAnalyst = WebScopeAnalyst(n2p_text_beautified)
        except:
#             cleanup(temp_files)
            return (js_file_path, None, 'IndexBuilder / ScopeAnalyst fail')
         
        ts = TranslationSummarizer()
        candidates += [['n2p', ''] + x 
                       for x in ts.compute_summary_unscoped(n2p_iBuilder, 
                                                            n2p_scopeAnalyst)]
            
    
#         # Run the JSNice from http://www.jsnice.org
#         jsNice = JSNice()
#         (ok, _out, _err) = jsNice.run(temp_files['path_tmp_u_a'], 
#                                       temp_files['path_tmp_jsnice'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'JSNice fail')
# 
#         ok = clear.run(temp_files['path_tmp_jsnice'], 
#                        temp_files['path_jsnice'])
#         if not ok:
#             cleanup(temp_files)
#             return (js_file_path, None, 'Beautifier fail')
#         
#         try:
#             lexer = Lexer(temp_files['path_jsnice'])
#             iBuilder = IndexBuilder(lexer.tokenList)
#         except:
#             cleanup(temp_files)
#             return (js_file_path, None, 'IndexBuilder fail')
#         
#         try:
#             scopeAnalyst = ScopeAnalyst(os.path.join(
#                                  os.path.dirname(os.path.realpath(__file__)), 
#                                  temp_files['path_jsnice']))
#             nameOrigin = scopeAnalyst.nameOrigin
#             isGlobal = scopeAnalyst.isGlobal
#             
#             for (name, def_scope) in nameOrigin.iterkeys():
#                 
#                 pos = scopeAnalyst.nameDefScope2pos[(name, def_scope)]
#                 (lin,col) = iBuilder.revFlatMat[pos]
#                 (tok_lin,tok_col) = iBuilder.revTokMap[(lin,col)]
#                 
#                 candidates.append(('JSNice', def_scope, 
#                                    tok_lin, tok_col, 
#                                    isGlobal.get((name, pos), True),
#                                    name, '',''))
#         except:
#             cleanup(temp_files)
#             return (js_file_path, None, 'ScopeAnalyst fail')
        
        
        
        
        # Compute scoping: name2scope is a dictionary where keys
        # are (name, start_index) tuples and values are scope identifiers. 
        # Note: start_index is a flat (unidimensional) index, 
        # not a (line_chr_idx, col_chr_idx) index.
        try:
            scopeAnalyst = WebScopeAnalyst(minified_text)
#             print 'Done: WebScopeAnalyst(minified_text)'
        except:
#             cleanup(temp_files)
            return (js_file_path, None, 'ScopeAnalyst fail')
         
         
        ################################################
        # Baseline translation: No renaming, no scoping
        ################################################

#         no_renaming = []
#         for _line_idx, line in enumerate(iBuilder_ugly.tokens):
#             no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
#           
# #         with open(temp_files['f2'], 'w') as f_no_renaming:
# #             f_no_renaming.writelines(no_renaming)
 
#         print 'Done: WebLexer(iBuilder_ugly.get_text())'
        
        for r_strategy, proxy in renaming_strategies.iteritems():
        
            md = WebMosesDecoder(proxy)
            print '\n', r_strategy
            
            # Apply renaming
            if True:
#             try:
                preRen = PreRenamer()
                after_text = preRen.rename(r_strategy, 
                                          scopeAnalyst, 
                                          iBuilder_ugly)
                
                
                (ok, beautified_after_text, _err) = clear.web_run(after_text)
                if not ok:
                    return (js_file_path, None, 'Beautifier fail')
                
#                 print beautified_after_text
                with open(temp_files['%s' % (r_strategy)], 'w') as f:
                    f.write(beautified_after_text)
                
                a_lexer = WebLexer(beautified_after_text)
                a_iBuilder = IndexBuilder(a_lexer.tokenList)
                a_scopeAnalyst = WebScopeAnalyst(beautified_after_text)
                
#             except:
#                 return (js_file_path, None, 'Renaming fail')
            
            lx = WebLexer(a_iBuilder.get_text())
            
            (ok, translation, _err) = md.run(lx.collapsedText)
            if not ok:
                return (js_file_path, None, 'Moses translation fail')
            
    #         print 'Done: WebMosesDecoder(renaming_strategies[\'no_renaming\'])'
    #         print translation
            
            (name_positions, 
             position_names) = prepHelpers(a_iBuilder, a_scopeAnalyst)

            nc = []
             
            if translation is not None:
                # Parse moses output
                mp = MosesParser()
                
                name_candidates = mp.parse(translation,
                                           a_iBuilder,
                                           position_names,
                                           a_scopeAnalyst)
                # name_candidates is a dictionary of dictionaries: 
                # keys are (name, None) (if scopeAnalyst=None) or 
                # (name, def_scope) tuples (otherwise); 
                # values are suggested translations with the sets 
                # of line numbers on which they appear.
                
        #         print 'name_candidates\n'
        #         for key, val in name_candidates.iteritems():
        #             print key
        #             for k,v in val.iteritems():
        #                 print '  ', k, v
                
                cs = ConsistencyResolver()
                ts = TranslationSummarizer()
                
                for c_strategy in consistency_strategies:
                    
                    renaming_map = cs.computeRenaming(c_strategy,
                                                      name_candidates,
                                                      name_positions,
                                                      a_iBuilder,
                                                      lm_path)
#         print '\nrenaming_map\n', renaming_map

                    r = [[c_strategy] + x 
                         for x in ts.compute_summary_scoped(renaming_map,
                                                            name_candidates,
                                                            a_iBuilder,
                                                            a_scopeAnalyst)]
            #         print 'Done: ts.compute_summary_scoped(cs.computeLMRenaming(...))'
                    
                    if not r:
                        return False
                    nc += r
                
            
#             nc = processTranslationScoped(translation, 
#                                           iBuilder_ugly, 
#                                           scopeAnalyst, 
#                                           lm_path)
            if nc:
                candidates += [[r_strategy] + x for x in nc]
         
#         wof = WebMosesOutputFormatter()
#         translation_no_renaming = wof.formatOutput(mresults["nbest"])
#         print 'Done: WebMosesOutputFormatter().formatOutput(mresults["nbest"])'
        
#         ts = TranslationSummarizer()
#         nc = ts.compute_summary_unscoped(iBuilder_ugly, scopeAnalyst, prefix)
          
#        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
#                           'train.no_renaming', 'tuning', 'moses.ini'))
  
#         nc = processTranslationUnscoped(translation_no_renaming, 
#                                         iBuilder_ugly, 
#                                         lm_path, 
#                                         temp_files['f2'],
#                                         output_path, 
#                                         base_name)
#         if nc:
#             candidates += nc
  
 
 
 
         
        ################################################
        # Hash-based renaming, one line
        ################################################
         
#         # More complicated renaming: collect the context around  
#         # each name (global variables, API calls, punctuation)
#         # and build a hash of the concatenation.        
#         hash_def_one_renaming = renameUsingHashDefLine(scopeAnalyst, 
#                                                    iBuilder_ugly, 
#                                                    twoLines=False,
#                                                    debug=False)
#         with open(temp_files['f5'], 'w') as f_hash_def_one_renaming:
#             f_hash_def_one_renaming.writelines(hash_def_one_renaming)
#  
# #        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
# #                           'train.hash_def_one_renaming', 'tuning', 'moses.ini'))
# #        (_moses_ok, 
# #            translation_hash_renaming, 
# #            _err) = moses.run(temp_files['f5'])
# 
# #        print hash_def_one_renaming
#         lx = Lexer(temp_files['f5'])
# 
#         mosesParams = {}
#         mosesParams["text"] = lx.collapsedText # hash_def_one_renaming #lex_ugly.collapsedText
#         #mosesParams["align"] = "true"
#         #mosesParams["report-all-factors"] = "true"
# 
#         #print '\n=============\n', mosesParams["text"], '\n'
# 
#         mresults = proxy_one.translate(mosesParams)# __request("translate", mosesParams)
#         rawText = Postprocessor(mresults["nbest"])
#         translation_hash_renaming = rawText.getProcessedOutput()
# 
#          
#         nc = processTranslationScoped(translation_hash_renaming, 
#                                       iBuilder_ugly, 
#                                       scopeAnalyst, 
#                                       lm_path, 
#                                       temp_files['f5'], 
#                                       output_path, 
#                                       base_name)
#         if nc:
#             candidates += nc
#         
#         
#         
# #        nc = processTranslationScopedFallback(translation_hash_renaming, 
# #                                              translation_no_renaming,
# #                                              iBuilder_ugly, 
# #                                              scopeAnalyst, 
# #                                              lm_path, 
# #                                              temp_files['f7'], 
# #                                              output_path, 
# #                                              base_name)
# #        if nc:
# #            candidates += nc
# 
# 
#         hash_def_two_renaming = renameUsingHashDefLine(scopeAnalyst, 
#                                                    iBuilder_ugly, 
#                                                    twoLines=True,
#                                                    debug=False)
#         with open(temp_files['f6'], 'w') as f_hash_def_two_renaming:
#             f_hash_def_two_renaming.writelines(hash_def_two_renaming)
#  
# #        moses = MosesDecoder(ini_path=os.path.join(ini_path, \
# #                           'train.hash_def_one_renaming', 'tuning', 'moses.ini'))
# #        (_moses_ok, 
# #            translation_hash_renaming, 
# #            _err) = moses.run(temp_files['f5'])
# 
# #        print hash_def_one_renaming
#         lx = Lexer(temp_files['f6'])
# 
#         mosesParams = {}
#         mosesParams["text"] = lx.collapsedText # hash_def_one_renaming #lex_ugly.collapsedText
#         #mosesParams["align"] = "true"
#         #mosesParams["report-all-factors"] = "true"
# 
#         #print '\n=============\n', mosesParams["text"], '\n'
# 
#         mresults = proxy_two.translate(mosesParams)# __request("translate", mosesParams)
#         rawText = Postprocessor(mresults["nbest"])
#         translation_hash_renaming = rawText.getProcessedOutput()
# 
#          
#         nc = processTranslationScoped(translation_hash_renaming, 
#                                       iBuilder_ugly, 
#                                       scopeAnalyst, 
#                                       lm_path, 
#                                       temp_files['f6'], 
#                                       output_path, 
#                                       base_name)
#         if nc:
#             candidates += nc            
            
        
#         cleanup(temp_files)
#         cleanupRenamed(pid)
        return (js_file_path, 'OK', candidates)


    except Exception, e:
#         cleanup(temp_files)
#         cleanupRenamed(pid)
        return (js_file_path, None, str(e).replace("\n", ""))
    
    

if __name__=="__main__":

    corpus_root = os.path.abspath(sys.argv[1])
    testing_sample_path = os.path.abspath(sys.argv[2])
    
    output_path = Folder(sys.argv[3]).create()
    num_threads = int(sys.argv[4])
    lm_path = os.path.abspath(sys.argv[5])
#     ini_path = os.path.abspath(sys.argv[5])
    
    flog = 'log_test_' + os.path.basename(corpus_root)
    c_path = 'candidates.csv'
    #f1, f2, f3, f4, f5, f6, 
#     try:
#         for f in [flog, c_path]:
#             os.remove(os.path.join(output_path, f))
#     except:
#         pass

    consistency_strategies = ['lm', 'freqlen'] #'len', 
    
    renaming_strategies = {'no_renaming':xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"), 
                           'normalized':xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"),
                           'basic_renaming':xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"),
                           'hash_def_one_renaming':xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2"),
                           'hash_def_two_renaming':xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2")}
    
#     renaming_strategies = {'hash_def_one_renaming':xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:40001/RPC2")}
    
#     proxy_one = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:8081/RPC2")
#     proxy_two = xmlrpclib.ServerProxy("http://godeep.cs.ucdavis.edu:8082/RPC2")
#     proxy_nr = 

    # inputs = Folder(corpus_root).fullFileNames("*.js")
    
    with open(testing_sample_path, 'r') as f:
    
        reader = UnicodeReader(f)
    
    #     result = processFile(reader.next())
    
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
             

