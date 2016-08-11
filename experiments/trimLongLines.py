import sys
import os
import glob
from folderManager import Folder


root_path = os.path.abspath(sys.argv[1])
target_path = os.path.abspath(sys.argv[2])



for corpus in Folder(root_path).subfoldersNoHidden():

    print os.path.join(target_path, 
                        os.path.basename(corpus))
    o = Folder(os.path.join(target_path, 
                        os.path.basename(corpus))).create()

    corpus_files = [os.path.basename(f) \
                    for f in glob.glob(os.path.join(corpus, "*.js")) \
                    if os.path.basename(f).startswith("corpus.") and \
                        os.path.basename(f) != "corpus.orig.js"]
    suffixes = [f[7:-3] for f in corpus_files]
    print corpus,  corpus_files


# for idx, suffix in enumerate(suffixes):
#     
#     
#     variant = "train." + suffix
#     
#     moses_ini = open(os.path.join(root_path, variant, \
#                                   "model", "moses.ini"), "r").readlines()
#     
