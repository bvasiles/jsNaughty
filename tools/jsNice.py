import subprocess
PIPE = subprocess.PIPE


class JSNice:
    
    def __init__(self, path=None, flags=None):
        if flags is None:
            self.flags = ['--no-types']
        else:
            self.flags = flags

        if path is None:
            self.path = '/usr/local/bin/jsnice'
        else:
            self.path = path
    
        
    def run(self, in_file_path, out_file_path):
        unuglifyjs_ok = False
        
        command = [self.path] + \
                    self.flags + \
                    [in_file_path]
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
    
        if not proc.returncode:
            unuglifyjs_ok = True
            with open(out_file_path, 'w') as f:
                f.write(out)
    
        return (unuglifyjs_ok, out, err)
        
