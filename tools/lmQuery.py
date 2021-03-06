import subprocess
PIPE = subprocess.PIPE
import socket
import requests

class LMQuery:
    
    def __init__(self, lm_path, query_path=None):
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
        
        #E.G. echo "_fe8eefa5 . push ( _5a1652ee . substring ( i , iStrlen ) ) ;" | /home/bogdanv/mosesdecoder/bin/query -n -s /data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm
        echo = subprocess.Popen(['echo', line], stdout=PIPE)
#         print('    ', [self.query_path, '-n', '-s', line, self.lm_path])
        proc = subprocess.Popen([self.query_path, 
                               '-n', '-s', #'sentence', 
                               self.lm_path], 
                              stdin=echo.stdout, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
        
        if not proc.returncode:
            lm_ok = True
            
#             print out
#             print err
            
            # Total: -14.223319 OOV: 0
            # Perplexity including OOVs:    38.05123735142437
            # Perplexity excluding OOVs:    38.05123735142437
            # OOVs:    0
            # Tokens:    9
            
            lines = out.split('\n')
            logProb = float(lines[0].split(' ')[1])
            # oovProb = int(lines[0].split(' ')[-1])
#            print(" LM DEBUG LINE: " + line)

#            print("      LM Query: " + " ".join([self.query_path, 
#                                '-n', '-s', #'sentence', 
#                                self.lm_path]) + " " + line + ' ---> ' + str(logProb))
            
        return (lm_ok, logProb, err)


    def queryServer(self, text):
        lm_ok = False
        logProb = None

#        if True:
        try:
            logText = requests.get("http://0.0.0.0:9090/score",{"q":text})
#            print(logText.text)
            logProb = float(logText.text)
            # oovProb = int(lines[0].split(' ')[-1])
            #print(" LM DEBUG LINE: " + line)
#            print(" LM Query: "  + str(text) + ' ---> ' + str(logProb))

            return (True, logProb, "LM QUERY OK")
        except:
            return (False, logProb, "LM QUERY FAILED")
