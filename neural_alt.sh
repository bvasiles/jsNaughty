#python experiments/runNeuralTestCorpus.py -s experiments/results/test_replication_lm/ -o experiments/results/test_replication_lm/

python experiments/runNeuralTestCorpus.py -s experiments/results/test_replication_freq/ -o experiments/results/test_replication_freq/

python experiments/testStatsNoSanity.py experiments/results/test_replication_lm/candidates.csv experiments/results/test_replication_lm/ experiments/results/test_replication_lm/log_test_test_replication_lm 1 1

python experiments/testStatsNoSanity.py experiments/results/test_replication_freq/candidates.csv experiments/results/test_replication_freq/ experiments/results/test_replication_freq/log_test_test_replication_freq 1 1
