import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
from unicodeManager import UnicodeReader, UnicodeWriter 
from tools import Dos2Unix


def processFile(l):
    
    js_file_path = l[0]
    
    try:
        d2u = Dos2Unix(os.path.join(corpus_root, js_file_path))
        return (js_file_path, d2u)
    except Exception, e:
        return (js_file_path, str(e))

    
    
corpus_root = os.path.abspath(sys.argv[1])
training_sample_path = sys.argv[2]

log_path = sys.argv[3]


with open(training_sample_path, 'r') as f:

    reader = UnicodeReader(f)

    flog = 'log_dos2unix_' + os.path.basename(training_sample_path)
 
    try:
        for f in [flog]:
            os.remove(os.path.join(log_path, f))
    except:
        pass

    pool = multiprocessing.Pool(processes=8)

    for result in pool.imap_unordered(processFile, reader):
      
        with open(os.path.join(log_path, flog), 'a') as g:
            writer = UnicodeWriter(g)
            writer.writerow(result)
  

