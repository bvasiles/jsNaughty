import subprocess
PIPE = subprocess.PIPE
import socket
from mosesOutputFormatter import WebMosesOutputFormatter
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
#         print 'Moses:', self.ini_path
        
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


        
class WebMosesDecoder:

    def __init__(self, proxy):
        self.proxy = proxy
        
        self.mosesParams = {}
        self.mosesParams["align"] = "true"
        self.mosesParams["report-all-factors"] = "true"


    def run(self, collapsed_text):
        self.mosesParams["text"] = collapsed_text
        
#         print 'Translating:\n', collapsed_text 
        
        try:
            mresults = self.proxy.translate(self.mosesParams)# __request("translate", mosesParams)
            
            print '\nmoses-----------------'
            for k,v in mresults.iteritems():
                print k,v
#             print mresults
            
            parser = WebMosesOutputFormatter()
            moses_output = parser.formatOutput(mresults["nbest"])
            
            return (True, moses_output, "")
        
        except Exception as err:
#             print 'Translation failed'
            return (False, None, err)


