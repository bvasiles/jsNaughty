import os

import sys
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))

import multiprocessing
from folderManager import Folder
from unicodeManager import UnicodeWriter 
from tools import MiniChecker, Preprocessor, Beautifier


class TimeExceededError(Exception): pass
def timeout(signum, frame):
    raise TimeExceededError, "Timed Out"


import signal
#SIGALRM is only usable on a unix platform
signal.signal(signal.SIGALRM, timeout)



def processFile(js_file_path):
    
    pid = int(multiprocessing.current_process().ident)
    
    try:
        signal.alarm(600)
        
        prepro = Preprocessor(js_file_path)
        prepro.write_temp_file('tmp_%d.js' % pid)
            
        beauty = Beautifier()
        ok = beauty.run('tmp_%d.js' % pid, 'tmp_%d.b.js' % pid)
        os.remove('tmp_%d.js' % pid)
            
        if ok:
            mc = MiniChecker('tmp_%d.b.js' % pid)
            try:
                isMini = mc.compare(keep_mini=False)
            except Exception as e:
                isMini = str(e)
                
            os.remove('tmp_%d.b.js' % pid)
            return [os.path.basename(js_file_path), isMini]
        
        else:
            return [os.path.basename(js_file_path), 'Beautifier failed']
        
    except TimeExceededError:
        os.remove('tmp_%d.js' % pid)
        os.remove('tmp_%d.b.js' % pid)
        return [os.path.basename(js_file_path), 'Timeout']
        

    
    
corpus_dir = Folder(sys.argv[1])

pool = multiprocessing.Pool(processes=8)
with open('isMinified.csv', 'wb') as f:
    writer = UnicodeWriter(f)
    for line in pool.imap(processFile, corpus_dir.fullFileNames("*.js")):
        writer.writerow(line)

