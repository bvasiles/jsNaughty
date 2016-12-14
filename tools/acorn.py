import subprocess
PIPE = subprocess.PIPE
import socket


class Acorn:
    
    def __init__(self, path=None, flags=None):
        if flags is None:
            self.flags = ['--compact']
        else:
            self.flags = flags

        if path is None:
            if socket.gethostname() == 'bogdan.mac' or \
                    socket.gethostname() == 'godot':
                self.path = '/usr/local/bin/acorn'
            elif socket.gethostname() == 'Caseys-MacBook-Pro.local' or socket.gethostname()== 'campus-055-006.ucdavis.edu':
                self.path = '/Users/caseycas/node_modules/acorn/bin/acorn'
            else:
                print(socket.gethostname())
                self.path = 'acorn'
        else:
            self.path = path
    
        
    def run(self, in_file_path, out_file_path=None):
        acorn_ok = False
        stdout = None
        
        command = [self.path] + \
                    self.flags + \
                    [in_file_path]

        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        pc = proc.communicate()
    
        if not proc.returncode:
            acorn_ok = True
            stdout = pc[0]
            
            if out_file_path is not None:
                out_file = open(out_file_path, 'w')
                out_file.write(stdout)
                out_file.close()
        
        return (stdout, acorn_ok)
        
