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
#set -e
#set -u
#
/home/bogdanv/mosesdecoder/bin/processPhraseTableMin -in %s -nscores 4 -out %s -threads %s >& %s &
''' % (os.path.join(root_path, variant), \
       os.path.join(root_path, variant, "stdout-%j.txt"), \
       os.path.join(root_path, variant, "stderr-%j.txt"), \
       "binPhT%d" % idx, \
       str(n_cores), \
       os.path.join(root_path, variant, "model", "phrase-table.gz"), \
       os.path.join(root_path, variant, "model", "phrase-table"), \
       str(n_cores),
       os.path.join(root_path, variant, "binPhT.out"))
    
    with open(os.path.join(root_path, variant, "binPhT.sh"), "w") as f:
        f.write(text)
        
    st = os.stat(os.path.join(root_path, variant, "binPhT.sh"))
    os.chmod(os.path.join(root_path, variant, "binPhT.sh"), st.st_mode | stat.S_IEXEC)


