import sys
import os
import glob
import stat

root_path = os.path.abspath(sys.argv[1])
tune_path = os.path.abspath(sys.argv[2])
n_cores = sys.argv[3]

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
/home/bogdanv/mosesdecoder/scripts/training/mert-moses.pl %s %s --decoder-flags="-threads %s" /home/bogdanv/mosesdecoder/bin/moses %s --mertdir /home/bogdanv/mosesdecoder/bin/ --rootdir /home/bogdanv/mosesdecoder/scripts --working-dir %s > %s
''' % (os.path.join(root_path, variant), \
       os.path.join(root_path, variant, "stdout-%j.txt"), \
       os.path.join(root_path, variant, "stderr-%j.txt"), \
       "mert%d" % idx, \
       str(n_cores), \
       os.path.join(tune_path, "corpus." + suffix + ".js"), \
       os.path.join(tune_path, "corpus.orig.js"), \
       str(n_cores),
       os.path.join(root_path, variant, "model", "model.bin.ini"), \
       os.path.join(root_path, variant), \
       os.path.join(root_path, variant, "mert.out"))
    
    with open(os.path.join(root_path, variant, "tune.sh"), "w") as f:
        f.write(text)
        
    st = os.stat(os.path.join(root_path, variant, "tune.sh"))
    os.chmod(os.path.join(root_path, variant, "tune.sh"), st.st_mode | stat.S_IEXEC)


