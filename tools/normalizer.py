import subprocess
PIPE = subprocess.PIPE


class Normalizer:
    
    def __init__(self, normalizer_js_path=None):
        if normalizer_js_path is None:
            import os
            self.normalizer_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir, 'node_normalizer'))
        else:
            self.normalizer_dir = normalizer_js_path
        
        
    def run(self, in_file_path, rename=True, out_file_path=None):
        ok = False
        
        command = ['node', 'normalize.js', in_file_path, str(rename).lower()]
        proc = subprocess.Popen(command, 
                                stderr=PIPE, stdout=PIPE, 
                                cwd=self.normalizer_dir)

        out, err = proc.communicate()
        
        if not proc.returncode:
            ok = True
            if out_file_path is not None:
                with open(out_file_path, 'w') as f:
                    f.write(out)
    
        return (ok, out, err)
        