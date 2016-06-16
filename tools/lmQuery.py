import subprocess
PIPE = subprocess.PIPE


class LMQuery:
    
    def __init__(self, query_path=None, lm_path=None):
        if query_path is None:
            self.query_path = '/Users/bogdanv/mosesdecoder/bin/query'
        else:
            self.query_path = query_path

        if lm_path is None:
            self.lm_path = '/Users/bogdanv/mosesdecoder/working/lm/js.blm.lm'
        else:
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
