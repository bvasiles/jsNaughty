import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
import glob
import stat
from folderManager import Folder


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
#
/home/bogdanv/mosesdecoder/scripts/training/mert-moses.pl %s %s --decoder-flags="-threads %s" --nbest=10 /home/bogdanv/mosesdecoder/bin/moses %s --mertdir /home/bogdanv/mosesdecoder/bin/ --rootdir /home/bogdanv/mosesdecoder/scripts --working-dir %s &> %s &
''' % (os.path.join(tune_path, "corpus." + suffix + ".js"), \
       os.path.join(tune_path, "corpus.orig.js"), \
       str(n_cores),
       os.path.join(root_path, variant, "model", "moses.bin.ini"), \
       os.path.join(root_path, variant, "tuning"), \
       os.path.join(root_path, variant, "tuning", "mert.out"))
    
    with open(os.path.join(root_path, variant, "tune.sh"), "w") as f:
        f.write(text)
        
    st = os.stat(os.path.join(root_path, variant, "tune.sh"))
    os.chmod(os.path.join(root_path, variant, "tune.sh"), st.st_mode | stat.S_IEXEC)

    Folder(os.path.join(root_path, variant, "tuning")).create()
    
    
