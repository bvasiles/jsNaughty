#!/bin/bash -l
#SBATCH -D /home/bogdanv/deobfuscator/experiments/
#SBATCH -o /home/bogdanv/deobfuscator/experiments/stdout-%j.txt
#SBATCH -e /home/bogdanv/deobfuscator/experiments/stderr-%j.txt
#SBATCH -J moses
#SBATCH -n 32
#
set -e
set -u
#
/home/bogdanv/mosesdecoder/scripts/training/train-model.perl -root-dir /home/bogdanv/deobfuscator/experiments/corpora/corpus.10k/train.no_renaming -corpus /home/bogdanv/deobfuscator/experiments/corpora/corpus.10k/train.no_renaming/corpus/corpus -f ugly -e clear -cores 32 --alignment intersect -reordering distance -lm 0:5:/home/bogdanv/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm:8 --max-phrase-length 20 -external-bin-dir /home/bogdanv/mosesdecoder/bin --first-step 4 --last-step 9 > /home/bogdanv/deobfuscator/experiments/corpora/corpus.10k/train.no_renaming/training.out

