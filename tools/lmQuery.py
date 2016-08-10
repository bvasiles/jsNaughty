import subprocess
PIPE = subprocess.PIPE
import socket


class LMQuery:
    
    def __init__(self, query_path=None, lm_path):
        if query_path is None:
            if socket.gethostname() == 'bogdan.mac':
                self.query_path = '/Users/bogdanv/mosesdecoder/bin/query'
            elif socket.gethostname() == 'godot':
                self.query_path = '/home/bogdan/mosesdecoder/bin/query'
            else:
                self.query_path = '/home/bogdanv/mosesdecoder/bin/query'
        else:
            self.query_path = query_path

        self.lm_path = lm_path
            
    
    def run(self, line):
        lm_ok = False
        logProb = None
        
        echo = subprocess.Popen(['echo', line], stdout=PIPE)
        proc = subprocess.Popen([self.query_path, 
                               '-n', '-v', 'sentence', 
                               self.lm_path], 
                              stdin=echo.stdout, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
        
        if not proc.returncode:
            lm_ok = True
            
            # Total: -14.223319 OOV: 0
            # Perplexity including OOVs:    38.05123735142437
            # Perplexity excluding OOVs:    38.05123735142437
            # OOVs:    0
            # Tokens:    9
            
            lines = out.split('\n')
            logProb = float(lines[0].split(' ')[1])
            # oovProb = int(lines[0].split(' ')[-1])
            
        return (lm_ok, logProb, err)
