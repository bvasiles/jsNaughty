import subprocess
PIPE = subprocess.PIPE
import socket
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from tools import  WebLMPreprocessor, Beautifier

command = ['/usr/local/bin/uglifyjs', '-b']
inputText = u'''
writeRandomQuote = function ( ) {
var e = new Array ( ) ;
e [ 0 ] = "one\\u2019s level of peace of mind.";
var o = Math . floor ( Math . random ( ) * e . length ) ;
document . write ( e [ o ] ) ;
} ;
'''

prepro = WebLMPreprocessor(inputText)
prepro_text = str(prepro)
print(prepro_text)

clear = Beautifier()
#TODO: Need a text version of beautifier to avoid the file read and write.
(ok, beautified_text, _err) = clear.web_run(prepro_text)
print(ok)
print(beautified_text)
print(_err)
        
#proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE, stdin=PIPE)
#out, err = proc.communicate(input=inputText)
#print(out)
#print(err)
#if not proc.returncode:
#    print("okay")