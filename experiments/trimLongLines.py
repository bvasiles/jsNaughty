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
                    for f in glob.glob(os.path.join(os.path.join(root_path, corpus), "*.js")) \
                    if os.path.basename(f).startswith("corpus.") and \
                        os.path.basename(f) != "corpus.orig.js"]
    
    for f in corpus_files:
        with open(os.path.join(target_path, 
                              os.path.basename(corpus),
                              os.path.basename(f)), "w") as g:
            for row in open(f).readlines():
                if len(row.split()) <= 20:
                    g.write(row)


