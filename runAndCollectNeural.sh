python experiments/runNeuralTestCorpus.py -s experiments/results/jsnaughty_test_set/ -o experiments/results/jsnaughty_test_set/ -start 0 -stop 250 --reset
python experiments/runNeuralTestCorpus.py -s experiments/results/jsnaughty_test_set/ -o experiments/results/jsnaughty_test_set/  -start 251 -stop 2150
python experiments/testStatsNoSanity.py experiments/results/jsnaughty_test_set/candidates.csv experiments/results/jsnaughty_test_set/ experiments/results/jsnaughty_test_set/log_test_jsnaughty_test_set 1 1
