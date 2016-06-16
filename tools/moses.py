import subprocess
PIPE = subprocess.PIPE


class MosesDecoder:
    
    def __init__(self, path=None, ini_path=None):
        if path is None:
            self.command = ['/Users/bogdanv/mosesdecoder/bin/moses']
        else:
            self.command = [path]
    
        if ini_path is None:
            self.ini_path = '/Users/bogdanv/mosesdecoder/working/bin-model/moses.ini'
        else:
            self.ini_path = ini_path

        
    def run(self, in_file_path, out_file_path):
        moses_ok = False
        
        command = self.command + \
                    ['-f', self.ini_path] + \
                    ['-input-file', in_file_path] + \
                    ['-n-best-list', '-', '10']
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
    
        if not proc.returncode:
            moses_ok = True
    
        return (moses_ok, out, err)
        
