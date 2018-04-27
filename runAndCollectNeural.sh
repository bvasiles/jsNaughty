#!/bin/bash
# python experiments/runNeuralTestCorpus.py -s experiments/results/jsnaughty_test_set/ \
#   -o experiments/results/jsnaughty_test_set/ -start 24 -stop 24 --reset
python experiments/runNeuralTestCorpus.py -s experiments/results/jsnaughty_test_set/ \
  -o experiments/results/jsnaughty_test_set/  -start 0 -stop 2150  
  
python experiments/testStatsNoSanity.py experiments/results/2018-04-16-old-hash/candidates.csv \
  experiments/results/jsnaughty_test_set/ \
  experiments/results/2018-04-16-old-hash/log_test_jsnaughty_test_set 1 1

