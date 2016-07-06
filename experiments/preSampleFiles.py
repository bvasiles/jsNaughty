import os
import random
from shutil import copyfile

import sys
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))

from folderManager import Folder

corpus_dir = Folder(sys.argv[1])
sample_size = int(sys.argv[2])
out_dir = Folder(sys.argv[3]).create()

corpus_sample = random.sample(corpus_dir.fullFileNames("*.js"), sample_size)

for f in corpus_sample:
    copyfile(f, os.path.join(out_dir.path(), os.path.basename(f)))


