import subprocess
PIPE = subprocess.PIPE
import socket
from preprocessor import replaceSciNotNum, fixIncompleteDecimals, formatLines, formatTokens
from pygments import lex
from pygments.lexers import get_lexer_for_filename


class Uglifier:
    
    def __init__(self, path=None, flags=None):
        # Default flags:
        # - minimize, most frequent var gets shortest name
        if flags is None:
            self.flags = ['-m', 'sort', '-b']
            #'--acorn', 
        else:
            self.flags = flags
        
        if path is None:
            if socket.gethostname() == 'godeep':
                # Add HPC1 cluster here
                self.path = 'uglifyjs'
            else:
                self.path = '/usr/local/bin/uglifyjs'

#             if socket.gethostname() == 'bogdan.mac' or \
#                     socket.gethostname() == 'godot' or \
#                     socket.gethostname() == 'Caseys-MacBook-Pro.local' or \
#                     socket.gethostname()== 'campus-055-006.ucdavis.edu':
#                 self.path = '/usr/local/bin/uglifyjs'
#             else:
#                 # Godeep & HPC1 Cluster
#                 self.path = 'uglifyjs'
        else:
            self.path = path
        
        
    def run(self, in_file_path, out_file_path):
        uglifyjs_ok = False
        
        # Call uglifyjs
        command = [self.path, in_file_path] + \
                    self.flags + \
                    ['-o', out_file_path]
        #print(command)
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        _pc = proc.communicate()
    
        if not proc.returncode:
            uglifyjs_ok = True
    
        return uglifyjs_ok
    
    
    def web_run(self, inputText):
        '''
        Variant that inputs from stdin and outputs to stdout.  Avoid the
        writing to file for more speed when running this as a web service.
        '''
        uglifyjs_ok = False
        #print(inputText)
        # Call uglifyjs
        command = [self.path] + self.flags
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE, stdin=PIPE)
        #print(command)
        try:
            out, err = proc.communicate(input=inputText)
        except:
            out, err = proc.communicate(input=inputText.encode('utf8'))#.decode('unicode_escape'))
        #out, err = proc.communicate(input=inputText.encode('utf16')) # JS is non-quite UTF-16 or UCS-02 (but either should be okay?)
        
        if not proc.returncode:
            uglifyjs_ok = True
   
        lexer = get_lexer_for_filename("jsFile.js")
        tokenList = list(lex(replaceSciNotNum(out), lexer))
        # Replace .1 by 0.1
        tokenList = fixIncompleteDecimals(tokenList)
        lines = formatTokens(tokenList)
        
        return (uglifyjs_ok, formatLines(lines).encode('utf8'), err)
    
    
    def web_run_end(self, inputText):
        '''
        Variant that inputs from stdin and outputs to stdout.  Avoid the
        writing to file for more speed when running this as a web service.
        '''
        uglifyjs_ok = False
        #print(inputText)
        # Call uglifyjs
        command = [self.path] + self.flags
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE, stdin=PIPE)
        #print(command)
        try:
            out, err = proc.communicate(input=inputText)
        except:
            out, err = proc.communicate(input=inputText.encode('utf8'))#.decode('unicode_escape'))
        #out, err = proc.communicate(input=inputText.encode('utf16')) # JS is non-quite UTF-16 or UCS-02 (but either should be okay?)
        
        if not proc.returncode:
            uglifyjs_ok = True
            
        return (uglifyjs_ok, out, err)




class Beautifier(Uglifier):

    def __init__(self):
        Uglifier.__init__(self, flags=['-b'])

    
    
