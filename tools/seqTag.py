import subprocess
PIPE = subprocess.PIPE
import socket
import requests
import os

class SeqTag:
    
    def __init__(self, path=None, flags=None):
        #if flags is None:
        #    self.flags = ['--no-types']
        #else:
        #    self.flags = flags

        if path is None:
            self.path = '/home/sismail/289n/ecs289nproject/evaluate.py'
        else:
            self.path = path
    
    #Does the text come as an argument or is it fed in later?
    def web_runCLI(self, input_text, out_file_path=None):
        success_flag = False

        #Possibly want to enable GPU usage (with CUDA_VISIBLE_DEVICES=0)
        command = ["python3", self.path] + \
                    [input_text]
        print(command)
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
        out, err = proc.communicate()
    
        if not proc.returncode:
            success_flag = True
            if out_file_path is not None:
                with open(out_file_path, 'w') as f:
                    f.write(out)
    
        return (success_flag, out, err)

    def web_runIUI(self, input_text, out_file_path=None):
        success_flag = False
        
        # Call unuglifyjs
        command = ["python3", self.path]
        proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE, stdin=PIPE)
        out, err = proc.communicate(input=input_text)
        
        print out, err
    
        if not proc.returncode:
            success_flag = True
        
            if out_file_path is not None:
                with open(out_file_path, 'w') as f:
                    f.write(out)
    
        return (success_flag, out, err)
       

    def mock_run(self): 
        sample_out = open("testing/neural_test_files/sample_out1.js", 'r').readlines()
        return (True, sample_out, "")

    def queryServer(self, text):
        logText = text
        tmp_file = os.path.abspath("tmp.js")
        with open(tmp_file, 'w') as f:
            f.write(text)
#        if True:
        try:
            logText = requests.get("http://0.0.0.0:9093/evaluate",{"q":tmp_file})

            return (True, logText.text.split(" "), "LM QUERY OK")
        except:
            return (False, text, "LM QUERY FAILED")
