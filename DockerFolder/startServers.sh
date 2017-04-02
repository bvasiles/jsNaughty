nohup python tools/lmServer.py &
nohup /home/mosesdecoder/bin/mosesserver --server-port 40021 --server-log server40021.log --minphr-memory --minlexr-memory -f ./phrase-tables/no_renaming/moses.lm2.ini -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&
nohup /home/mosesdecoder/bin/mosesserver --server-port 40022 --server-log server40022.log --minphr-memory --minlexr-memory -f ./phrase-tables/hash_def_one_renaming/moses.lm2.ini -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&
