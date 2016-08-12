import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import glob
from folderManager import Folder


root_path = os.path.abspath(sys.argv[1])
target_path = os.path.abspath(sys.argv[2])



for corpus in Folder(root_path).subfoldersNoHidden():

    print os.path.join(target_path, 
                        os.path.basename(corpus))
    o = Folder(os.path.join(target_path, 
                        os.path.basename(corpus))).create()

    corpus_files = [f \
                    for f in glob.glob(os.path.join(root_path, corpus, "*.js")) \
                    if os.path.basename(f).startswith("corpus.")]
    
    corpora = {}
    for f in corpus_files:
        corpora[f] = open(f).readlines()
    
    f_orig = [f for f in corpus_files 
                    if os.path.basename(f).endswith("corpus.orig.js")][0]
    orig = corpora[f_orig]
    
    gs = [(f, open(os.path.join(target_path, 
                              os.path.basename(corpus),
                              os.path.basename(f)), "w")) 
          for f in corpus_files]
    
    for idx, row in enumerate(orig):
        if len(row.split()) <= 20:
            if len(set([corpora[f][idx] for f in corpus_files])) > 1:
                for (f,g) in gs:
                    g.write(corpora[f][idx])
    


