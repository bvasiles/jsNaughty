nohup /home/ccasal/moses_alt/bin/mosesserver --server-port 40021 --server-log server40021.log --minphr-memory --minlexr-memory -f ./data/moses_onepercent_no_renaming/moses.lm.ini -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&
nohup /home/ccasal/moses_alt/bin/mosesserver --server-port 40022 --server-log server40022.log --minphr-memory --minlexr-memory -f ./data/moses_onepercent/moses.lm.ini -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&
