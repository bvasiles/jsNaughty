import sys
import os
import glob
# import stat

root_path = os.path.abspath(sys.argv[1])
n_cores = sys.argv[2]

corpus_files = [os.path.basename(f) \
                    for f in glob.glob(os.path.join(root_path, "*.js")) \
                    if os.path.basename(f).startswith("corpus.") and \
                        os.path.basename(f) != "corpus.orig.js"]

suffixes = [f[7:-3] for f in corpus_files]

for idx, suffix in enumerate(suffixes):
    
    variant = "train." + suffix
    
    moses_ini = open(os.path.join(root_path, variant, \
                                  "model", "moses.ini"), "r").readlines()
    
    idx_distortion = moses_ini.index("[distortion-limit]\n") + 1
    moses_ini[idx_distortion] = "0\n"
    
    with open(os.path.join(root_path, variant, \
                           "model", "moses.bin.ini"), "w") as f:
        f.writelines(moses_ini)
    


