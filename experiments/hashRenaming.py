import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import Preprocessor, IndexBuilder, Beautifier, Lexer, ScopeAnalyst
from renamingStrategies import renameUsingHashDefLine


def writeTmpLines(lines, 
                  out_file_path):
    
    js_tmp = open(out_file_path, 'w')
    js_tmp.write('\n'.join([' '.join([token for (_token_type, token) in line]) 
                            for line in lines]).encode('utf8'))
    js_tmp.write('\n')
    js_tmp.close()


    
input_file = os.path.abspath(sys.argv[1])
output_file = os.path.abspath(sys.argv[2])
mode = int(sys.argv[3])


prepro = Preprocessor(input_file)
prepro.write_temp_file('tmp.js')

clear = Beautifier()
ok = clear.run('tmp.js', 
               'tmp.b.js')
  
lexer = Lexer('tmp.b.js')
iBuilder = IndexBuilder(lexer.tokenList)

scopeAnalyst = ScopeAnalyst(os.path.join(
                         os.path.dirname(os.path.realpath(__file__)), 
                         'tmp.b.js'))

hash_renaming = renameUsingHashDefLine(scopeAnalyst, 
                                   iBuilder, 
                                   twoLines=False,
                                   debug=mode)

with open(output_file, 'w') as f:
    f.writelines(hash_renaming)
# writeTmpLines(hash_renaming, output_file)
 
# clear = Beautifier()
# ok = clear.run(tmp_path, os.path.join(output_path, o_path))
# if not ok:
#     return False
# 
# 
# with open(output_file, 'w') as f:
#     f.writelines(renaming)


