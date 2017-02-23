import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Lexer, IndexBuilder, Aligner, WebLexer, Beautifier
import random
from folderManager import Folder
from pygments.token import Token, is_token_subtype


def processFile(js_file_path):

    try:        
        
        # Num tokens before vs after
        try:
            tok1 = Lexer(os.path.join(files_root, 'orig', js_file_path)).tokenList
            tok2 = Lexer(os.path.join(files_root, 'no_renaming', js_file_path)).tokenList
#             tok3 = Lexer(os.path.join(files_root, 'basic_renaming', js_file_path)).tokenList
#             tok4 = Lexer(os.path.join(files_root, 'normalized', js_file_path)).tokenList
            tok5 = Lexer(os.path.join(files_root, 'hash_def_one_renaming', js_file_path)).tokenList
            tok6 = Lexer(os.path.join(files_root, 'hash_def_two_renaming', js_file_path)).tokenList
        except:
            return (js_file_path, None, 'Lexer fail')
        
        # For now only work with minified files that have
        # the same number of tokens as the originals
        if not len(set([len(tok1), len(tok2), len(tok5), len(tok6)])) == 1:
            return (js_file_path, None, 'Num tokens mismatch')
        
        clear = Beautifier()
        # Align minified and clear files, in case the beautifier 
        # did something weird
        aligner = Aligner()
        
        (aligned1, aligned2) = aligner.web_align(tok1, tok2)
        
        (ok, beautified1, _err) = clear.web_run(aligned1)
        tok11 = WebLexer(beautified1).tokenList
        
        (ok, beautified2, _err) = clear.web_run(aligned2)
        tok22 = WebLexer(beautified2).tokenList
        
        (aligned5, aligned2) = aligner.web_align(tok5, tok2)
        
        (ok, beautified5, _err) = clear.web_run(aligned5)
        tok55 = WebLexer(beautified5).tokenList
        
        (aligned6, aligned2) = aligner.web_align(tok6, tok2)
        
        (ok, beautified6, _err) = clear.web_run(aligned6)
        tok66 = WebLexer(beautified6).tokenList
            
#         try:
#             aligner = Aligner()
#             # This is already the baseline corpus, no (smart) renaming yet
#             aligner.align(temp_files['path_tmp_b'], 
#                           temp_files['path_tmp_u'])
#         except:
#             return (js_file_path, None, 'Aligner fail')
        
        try:
            iBuilder1 = IndexBuilder(tok11)
            iBuilder2 = IndexBuilder(tok22)
#             iBuilder3 = IndexBuilder(tok3)
#             iBuilder4 = IndexBuilder(tok4)
            iBuilder5 = IndexBuilder(tok55)
            iBuilder6 = IndexBuilder(tok66)
        except:
            return (js_file_path, None, 'IndexBuilder fail')

        # Check that at least one variable was renamed during minification
        orig_names = set([token for line in iBuilder1.tokens 
                          for (token_type, token) in line
                      if is_token_subtype(token_type, Token.Name)])
        ugly_names = set([token for line in iBuilder2.tokens 
                          for (token_type, token) in line
                      if is_token_subtype(token_type, Token.Name)])
        if not len(orig_names.difference(ugly_names)):
            return (js_file_path, None, 'Not minified')

        orig = [] 
        no_renaming = [] 
#         basic_renaming = []
#         normalized = []
        hash_def_one_renaming = []
        hash_def_two_renaming = []
        
        for _line_idx, line in enumerate(iBuilder1.tokens):
            orig.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        for _line_idx, line in enumerate(iBuilder2.tokens):
            no_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
        
#         for _line_idx, line in enumerate(iBuilder3.tokens):
#             basic_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
        
#         for _line_idx, line in enumerate(iBuilder4.tokens):
#             normalized.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        for _line_idx, line in enumerate(iBuilder5.tokens):
            hash_def_one_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        for _line_idx, line in enumerate(iBuilder6.tokens):
            hash_def_two_renaming.append(' '.join([t for (_tt,t) in line]) + "\n")
        
        
        return (js_file_path,
                orig, 
                no_renaming, 
#                 basic_renaming,
#                 normalized, 
                hash_def_one_renaming,
                hash_def_two_renaming)
        
    except Exception, e:
        return (js_file_path, None, str(e))
    
    

files_root = os.path.abspath(sys.argv[1])
output_path = Folder(sys.argv[2]).create()
sample_size = int(sys.argv[3])
num_threads = int(sys.argv[4])

flog = 'log_renameAndUglify'

in_log = set([])
reader = UnicodeReader(open(os.path.join(files_root, flog), 'r'))
try:
    for row in reader:
        if row[1] == 'OK':
            in_log.add(row[0])
except:
    pass
print len(in_log), 'in log'

on_disk = set(Folder(os.path.join(files_root, 'orig')).baseFileNames('*.js')).\
intersection(Folder(os.path.join(files_root, 'no_renaming')).baseFileNames('*.js')).\
intersection(Folder(os.path.join(files_root, 'hash_def_one_renaming')).baseFileNames('*.js')).\
intersection(Folder(os.path.join(files_root, 'hash_def_two_renaming')).baseFileNames('*.js'))
# intersection(Folder(os.path.join(files_root, 'basic_renaming')).baseFileNames('*.js')).\
# intersection(Folder(os.path.join(files_root, 'normalized')).baseFileNames('*.js')).\

print len(on_disk), 'on disk'


corpus_sample = random.sample(on_disk.intersection(in_log), sample_size)


f1 = 'corpus.orig.js'
f2 = 'corpus.no_renaming.js'
# f3 = 'corpus.basic_renaming.js'
# f4 = 'corpus.normalized.js'
f5 = 'corpus.hash_def_one_renaming.js'
f6 = 'corpus.hash_def_two_renaming.js'
glog = 'log_sample_%d.csv' % sample_size

try:
    for f in [f1, f2, f5, f6, glog]:
        os.remove(os.path.join(output_path, f))
except:
    pass

with open(os.path.join(output_path, glog), 'w') as g, \
        open(os.path.join(output_path, f1), 'w') as f_orig, \
        open(os.path.join(output_path, f2), 'w') as f_no_renaming, \
        open(os.path.join(output_path, f5), 'w') as f_hash_def_one_renaming, \
        open(os.path.join(output_path, f6), 'w') as f_hash_def_two_renaming:
#         open(os.path.join(output_path, f3), 'w') as f_basic_renaming, \
#         open(os.path.join(output_path, f4), 'w') as f_normalized, \

    writer = UnicodeWriter(g)

    pool = multiprocessing.Pool(processes=num_threads)

    for result in pool.imap_unordered(processFile, corpus_sample):
      
        if result[1] is not None:
            (js_file_path,
             orig, 
            no_renaming, 
#              basic_renaming, 
#              normalized,
             hash_def_one_renaming,
             hash_def_two_renaming) = result
            
            try:
                f_orig.writelines(orig)
                f_no_renaming.writelines(no_renaming)
#                 f_basic_renaming.writelines(basic_renaming)
#                 f_normalized.writelines(normalized)
                f_hash_def_one_renaming.writelines(hash_def_one_renaming)
                f_hash_def_two_renaming.writelines(hash_def_two_renaming)
                
                writer.writerow([js_file_path, 'OK'])
    
            except Exception, e:
                writer.writerow([js_file_path, str(e)])
            
        else:
            writer.writerow([result[0], result[2]])

