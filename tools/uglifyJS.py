import subprocess
PIPE = subprocess.PIPE
import socket


class Uglifier:
    
    def __init__(self, path=None, flags=None):
        # Default flags:
        # - minimize, most frequent var gets shortest name
        if flags is None:
            self.flags = ['--acorn', '-m', 'sort', '-b']
        else:
            self.flags = flags
        
        if path is None:
            print socket.gethostname()
            if socket.gethostname() == 'hpc1':
                self.path = '/share/apps/node_modules/uglify-js/bin/uglifyjs'
            else:
                self.path = '/usr/local/bin/uglifyjs'
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

    
class Beautifier(Uglifier):

    def __init__(self):
        Uglifier.__init__(self, flags=['-b'])

    
    