import subprocess
PIPE = subprocess.PIPE


class Dos2Unix:
    
    def __init__(self, path=None):
        if path is None:
            self.path = '/usr/bin/dos2unix'
        else:
            self.path = path
        
        
    def run(self, in_file_path):
        ok = False
        
        # Call dos2unix
        command = [self.path, in_file_path]
        
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        _pc = proc.communicate()
        
        if not proc.returncode:
            ok = True
    
        return ok
