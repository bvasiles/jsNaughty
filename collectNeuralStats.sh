python experiments/testStatsNoSanity.py experiments/results/test_replication_fix/candidates.csv experiments/results/test_replication_fix/ experiments/results/test_replication_fix/log_test_test_replication_fix 1 1

python experiments/testStatsNoSanity.py experiments/results/test_replication_keep_same/candidates.csv experiments/results/test_replication_keep_same/ experiments/results/test_replication_keep_same/log_test_test_replication_keep_same 1 1

python experiments/testStatsNoSanity.py experiments/results/test_rep_moses_1_percent/candidates.csv experiments/results/test_rep_moses_1_percent/ experiments/results/test_rep_moses_1_percent/log_test_test_rep_moses_1_percent 1 1

python experiments/testStatsNoSanity.py experiments/results/test_rep_moses_5_percent/candidates.csv experiments/results/test_rep_moses_5_percent/ experiments/results/test_rep_moses_5_percent/log_test_test_rep_moses_5_percent 1 1

#python experiments/testStatsNoSanity.py experiments/results/test_rep_neural_5_percent/candidates.csv experiments/results/test_rep_neural_5_percent/ experiments/results/test_rep_neural_5_percent/log_test_test_rep_neural_5_percent 1 1

cp experiments/results/test_replication_fix/stats.csv evaluation/neural_stats_fix_approx.csv
cp experiments/results/test_replication_keep_same/stats.csv evaluation/neural_stats_ks_approx.csv
cp experiments/results/test_rep_moses_1_percent/stats.csv evaluation/stats_moses_1_percent_approx.csv
cp experiments/results/test_rep_moses_5_percent/stats.csv evaluation/stats_moses_5_percent_approx.csv
#cp experiments/results/test_rep_neural_5_percent/stats.csv evaluation/stats_neural_5_percent_approx.csv