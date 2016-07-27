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
    
    l_phr_dict = [l for l in moses_ini \
                  if l.startswith("PhraseDictionaryMemory")][0]
    idx_phr_dict = moses_ini.index(l_phr_dict)
    parts = l_phr_dict.split()
    
    updated_parts = ["PhraseDictionaryCompact"] + \
                    parts[1:2] + \
                    [parts[3].replace("phrase-table.gz","phrase-table.minphr")] + \
                    parts[4:5]
    moses_ini[idx_phr_dict] = " ".join(updated_parts)
    
    with open(os.path.join(root_path, variant, \
                           "model", "moses.bin.ini"), "w") as f:
        f.writelines(moses_ini)
    


