dir=$1

/home/bogdan/mosesdecoder/scripts/training/train-model.perl \
 -root-dir $dir \
 -corpus $dir/corpus/corpus \ 
 -f ugly -e clear \
 -cores 8 \
 --alignment intersect \
 -reordering distance \
 -lm 0:5:/home/bogdan/deobfuscator/experiments/corpora/corpus.lm.970k/js.blm.lm:8 \
 --max-phrase-length 100 \
 -external-bin-dir /home/bogdan/mosesdecoder/bin \
 --first-step 4 --last-step 4 >& $dir/training.out &
