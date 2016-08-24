#!/bin/bash -l
#SBATCH -D /home/bogdanv/deobfuscator/experiments
#SBATCH -o /home/bogdanv/deobfuscator/experiments/stdout-%j.txt
#SBATCH -e /home/bogdanv/deobfuscator/experiments/stderr-%j.txt
#SBATCH -J corp50k
#SBATCH -n 32
#
module load node
set -e
set -u
#
python buildLineCorpus.py /home/bogdanv/js_files/ /home/bogdanv/deobfuscator/experiments/samples/trainingSample.50k.csv /home/bogdanv/deobfuscator/experiments/corpus.50k
