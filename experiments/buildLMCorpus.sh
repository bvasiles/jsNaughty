#!/bin/bash -l
#SBATCH -D /home/bogdanv/deobfuscator/experiments/
#SBATCH -o /home/bogdanv/deobfuscator/experiments/stdout-%j.txt
#SBATCH -e /home/bogdanv/deobfuscator/experiments/stderr-%j.txt
#SBATCH -J corpuslm
#SBATCH -n 32
set -e
set -u
#
python buildLMCorpus.py /home/bogdanv/js_files/ samples/trainingSample.csv corpus.lm
