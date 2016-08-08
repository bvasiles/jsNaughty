import os
import sys
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))

import json

import numpy
def median(lst):
    return numpy.median(numpy.array(lst))
def mean(lst):
    return numpy.mean(numpy.array(lst))

import multiprocessing
from folderManager import Folder
from unicodeManager import UnicodeReader, UnicodeWriter 

from tools import Acorn, Lexer

from huTools.structured import dict2et
from pygments.token import Token, is_token_subtype
from collections import Counter



def processFile(l):
    
    [js_file_path] = l
    
    try:
        # Compute AST but don't store, it's huge
        try:
            parser = Acorn()
            (acorn_ast, acorn_ok) = parser.run(os.path.join(corpus_root, js_file_path))
        except:
            return (js_file_path, None, 'Parser fail')
        
        if not acorn_ok:
            return (js_file_path, None, 'Parser fail')
        
        functions = []
        ast_ok = True
        try:
            # Read ast in json format
            ast = json.loads(acorn_ast)
    
            # Convert to ElementTree xml
            root = dict2et(ast)
            
            # Find all function declarations 
            # Record character positions in original file 
            for fd in root.findall("*//item[type='FunctionDeclaration']"):
                functions.append((fd.find('start').text, 
                                  fd.find('end').text))
        except:
            ast_ok = False
        
        if not ast_ok:
            return (js_file_path, None, 'JSON fail')

        # FIXME: FunctionExpression is different from FunctionDeclaration
        # FIXME: Can there be nested FunctionDeclarations?

        try:
            js = open(os.path.join(corpus_root, js_file_path), 'r').read().decode("utf-8")
        except UnicodeDecodeError:
            js = open(os.path.join(corpus_root, js_file_path), 'r').read()

        # Extract functions
        for (start, end) in functions:
            # extract function body
            f_body = js[int(start):int(end)]
            
            num_lines = f_body.count('\n')
    
            # write body to file
            f_file = os.path.basename(js_file_path).split('.')[0] + '_' + start + '_' + end + '.js'
            f_path = os.path.join(output_path, f_file)
                
            f = open(f_path, 'wb')
            try:
                f.write(f_body)
            except UnicodeEncodeError:
                f.write(f_body.encode("utf-8"))
            f.close()
        
        (js_file_path, 'OK')
            
#             # check if not too short and not too long
#             statinfo_js = os.stat(f_path)
#             num_bytes = statinfo_js.st_size
#              
#             # Num tokens
#             try:
#                 tokens = Lexer(f_path).tokenList
#             except:
#                 return (js_file_path, None, 'Lexer fail')
#         
#             names = [t for (tt,t) in tokens if is_token_subtype(tt, Token.Name)]
#             nameCounter = Counter(names)
#              
#             if len(nameCounter.keys()):
#                 num_names = len(nameCounter.keys())
#                 mean_name_occurences = mean(nameCounter.values())
#                 median_name_occurences = median(nameCounter.values())
#             else:
#                 num_names = 0
#                 mean_name_occurences = 0.0
#                 median_name_occurences = 0.0
#         
#             return (js_file_path, f_file, num_lines, 
#                     num_bytes, num_names, 
#                     '%.2f' % float(mean_name_occurences), 
#                     '%.2f' % float(median_name_occurences))
        
    except Exception, e:
        return (js_file_path, None, str(e))
    


sample_path = os.path.abspath(sys.argv[1])
corpus_root = os.path.abspath(sys.argv[2])

output_path = Folder(sys.argv[3]).create()
num_threads = int(sys.argv[4])


with open(sample_path, 'r') as f:

    reader = UnicodeReader(f)
    
    flog = 'log_js_functions_' + os.path.basename(sample_path)
    try:
        for f in [flog]:
            os.remove(os.path.join(output_path, f))
    except:
        pass
    
    pool = multiprocessing.Pool(processes=num_threads)

    for result in pool.imap_unordered(processFile, reader):
      
        with open(os.path.join(output_path, flog), 'a') as g:
            writer = UnicodeWriter(g)
            
            print result
#             writer.writerow(result)
                
        
