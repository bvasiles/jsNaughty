import subprocess
PIPE = subprocess.PIPE
import socket


class JSNice:
    
    def __init__(self, path=None, flags=None):
        if flags is None:
            self.flags = ['--no-types']
        else:
            self.flags = flags

        if path is None:
            if socket.gethostname() == 'bogdan.mac' or \
                    socket.gethostname() == 'godot':
                self.path = '/usr/local/bin/jsnice'
            else:
                self.path = '/share/apps/node_modules/jsnice/bin/jsnice'
        else:
            self.path = path
    
        
    def run(self, in_file_path, out_file_path=None):
        unuglifyjs_ok = False
        
        command = [self.path] + \
                    self.flags + \
                    [in_file_path]
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
    
        if not proc.returncode:
            unuglifyjs_ok = True
            if out_file_path is not None:
                with open(out_file_path, 'w') as f:
                    f.write(out)
    
        return (unuglifyjs_ok, out, err)
        
