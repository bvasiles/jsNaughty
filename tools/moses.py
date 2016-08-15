import subprocess
PIPE = subprocess.PIPE
import socket
# from pygments.token import Token, is_token_subtype


class MosesDecoder:
    
    def __init__(self, ini_path, path=None):
        if path is None:
            if socket.gethostname() == 'bogdan.mac':
                self.command = ['/Users/bogdanv/mosesdecoder/bin/moses']
            elif socket.gethostname() == 'godot':
                self.command = ['/home/bogdan/mosesdecoder/bin/moses']
            else:
                self.command = ['/home/bogdanv/mosesdecoder/bin/moses']
        else:
            self.command = [path]
    
        # moses.ini config file
        self.ini_path = ini_path
        print 'Moses:', self.ini_path
        
        self.translation = None

        
    def run(self, in_file_path):
        moses_ok = False
        
        command = self.command + \
                    ['-f', self.ini_path] + \
                    ['-input-file', in_file_path] + \
                    ['-n-best-list', '-', '10']
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
    
        if not proc.returncode:
            moses_ok = True
            self.translation = out
    
        return (moses_ok, out, err)


        
        
    
        
