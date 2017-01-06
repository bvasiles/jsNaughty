'''
Created on Jan 6, 2017

@author: Bogdan Vasilescu
'''

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import multiprocessing
import subprocess
PIPE = subprocess.PIPE
import glob



def processClear(variant):
    ok = False
        
    command = ['/home/ccasal/mosesphrasefilter/Bin/Linux/Index/IndexSA.O32', 
               os.path.join(root_path, variant, 'corpus', 'corpus.clear')]
    #print(command)
    proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
    out, err = proc.communicate()

    if not proc.returncode:
        ok = True
    
    return (ok, variant, out, err)


    
def processUgly(variant):
    ok = False
        
    command = ['/home/ccasal/mosesphrasefilter/Bin/Linux/Index/IndexSA.O32', 
               os.path.join(root_path, variant, 'corpus', 'corpus.ugly')]
    #print(command)
    proc = subprocess.Popen(command, stderr=PIPE, stdout=PIPE)
    out, err = proc.communicate()

    if not proc.returncode:
        ok = True
    
    return (ok, variant, out, err)
    



if __name__=="__main__":

    root_path = os.path.abspath(sys.argv[1])
    num_threads = int(sys.argv[2])
    
    corpus_files = [os.path.basename(f) \
                    for f in glob.glob(os.path.join(root_path, "*.js")) \
                    if os.path.basename(f).startswith("corpus.") and \
                        os.path.basename(f) != "corpus.orig.js"]

    suffixes = [f[7:-3] for f in corpus_files]
    
    variants = ["train." + suffix for suffix in suffixes]
    
    pool = multiprocessing.Pool(processes=num_threads)
    
    for result in pool.imap_unordered(processClear, variants[:1]):
        (ok, variant, out, err) = result
        
        with open(os.path.join(root_path, variant, 'corpus', 'clear.out'), 'w') as f, \
                open(os.path.join(root_path, variant, 'corpus', 'clear.err'), 'w') as g:
            f.write(out)
            g.write(err)
        
        
    for result in pool.imap_unordered(processUgly, variants):
        (ok, variant, out, err) = result
        
        with open(os.path.join(root_path, variant, 'corpus', 'ugly.out'), 'w') as f, \
                open(os.path.join(root_path, variant, 'corpus', 'ugly.err'), 'w') as g:
            f.write(out)
            g.write(err)
         
