import subprocess
PIPE = subprocess.PIPE
import socket


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
                self.path = 'uglifyjs'
            else:
                self.path = '/usr/local/bin/uglifyjs'
            #if socket.gethostname() == 'bogdan.mac' or \
            #        socket.gethostname() == 'godot' or socket.gethostname() == 'Caseys-MacBook-Pro.local' :
            #    self.path = '/usr/local/bin/uglifyjs'
            #else:
            #    self.path = 'uglifyjs'
        else:
            self.path = path
        
        
    def run(self, in_file_path, out_file_path):
        uglifyjs_ok = False
        
        # Call uglifyjs
        command = [self.path, in_file_path] + \
                    self.flags + \
                    ['-o', out_file_path]
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        _pc = proc.communicate()
    
        if not proc.returncode:
            uglifyjs_ok = True
    
        return uglifyjs_ok
    
    def webRun(self, inputText):
        '''
        Variant that inputs from stdin and outputs to stdout.  Avoid the
        writing to file for more speed when running this as a web service.
        '''
        uglifyjs_ok = False
        
        # Call uglifyjs
        command = [self.path, inputText] + self.flags
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
    
        if not proc.returncode:
            uglifyjs_ok = True
    
        return (uglifyjs_ok, out, err)

class Beautifier(Uglifier):

    def __init__(self):
        Uglifier.__init__(self, flags=['-b'])

    
    