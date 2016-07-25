import sys
import os
import glob
import stat

root_path = os.path.abspath(sys.argv[1])
n_cores = sys.argv[2]

corpus_files = [os.path.basename(f) \
                    for f in glob.glob(os.path.join(root_path, "*.js")) \
                    if os.path.basename(f).startswith("corpus.") and \
                        os.path.basename(f) != "corpus.orig.js"]

suffixes = [f[7:-3] for f in corpus_files]

for idx, suffix in enumerate(suffixes):
    
    variant = "train." + suffix
    
    text = '''#!/bin/bash -l
#SBATCH -D %s
#SBATCH -o %s
#SBATCH -e %s
#SBATCH -J %s
#SBATCH -n %s
#
set -e
set -u
#
/home/bogdanv/mosesdecoder/scripts/training/train-model.perl -root-dir %s -corpus %s -f ugly -e clear -cores %s --alignment intersect -reordering distance -lm 0:5:/home/bogdanv/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm:8 --max-phrase-length 20 -external-bin-dir /home/bogdanv/mosesdecoder/bin --first-step 4 --last-step 9 > %s
''' % (os.path.join(root_path, variant), \
       os.path.join(root_path, variant, "stdout-%j.txt"), \
       os.path.join(root_path, variant, "stderr-%j.txt"), \
       "moses%d" % idx, \
       str(n_cores), \
       os.path.join(root_path, variant), \
       os.path.join(root_path, variant, "corpus", "corpus"), \
       str(n_cores),
       os.path.join(root_path, variant, "training.out"))
    
    with open(os.path.join(root_path, variant, "train.sh"), "w") as f:
        f.write(text)
        
    st = os.stat(os.path.join(root_path, variant, "train.sh"))
    os.chmod(os.path.join(root_path, variant, "train.sh"), st.st_mode | stat.S_IEXEC)


