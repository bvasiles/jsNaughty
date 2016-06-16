import subprocess
PIPE = subprocess.PIPE


class UnuglifyJS:
    
    def __init__(self, path=None, flags=None):
        # Default flags:
        # --rename
        # --nice_formatting
        if flags is None:
            self.flags = ['--rename', '--nice_formatting']
        else:
            self.flags = flags

        if path is None:
            self.path = '/usr/local/bin/unuglifyjs'
        else:
            self.path = path
    
        
    def run(self, in_file_path, out_file_path):
        unuglifyjs_ok = False
        
        # Call unuglifyjs
        command = [self.path, in_file_path] + \
                    self.flags
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
    
        if not proc.returncode:
            unuglifyjs_ok = True
            with open(out_file_path, 'w') as f:
                f.write(out)
    
        return (unuglifyjs_ok, out, err)
        