Web framework for javascript deobfuscation tool.
While running, make sure the moses server pointed to by deobfuscate/experiments/mosesClient.py
	is running
	- E.g. "/home/ccasal/mosesdecoder/bin/mosesserver -f /data/bogdanv/deobfuscator/experiments/corpora/corpus.concat/train.no_renaming/tuning/moses.ini -n-best-list - 10"
	- You will want to background this with additional options (To be added), if you want the
	server to run more robustly.
Currently two servers are needed and are started with:
nohup /home/ccasal/moses_alt/bin/mosesserver --server-port 40021 --server-log server40021.log --minphr-memory --minlexr-memory -f /data/bogdanv/deobfuscator/experiments/corpora/newcorpus.300k/train.no_renaming/tuning/moses.lm2.ini -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&

nohup /home/ccasal/moses_alt/bin/mosesserver --server-port 40022 --server-log server40022.log --minphr-memory --minlexr-memory -f /data/bogdanv/deobfuscator/experiments/corpora/newcorpus.300k/train.hash_def_one_renaming/tuning/moses.lm2.ini -search-algorithm 1 -cube-pruning-pop-limit 2000 -s 2000 -n-best-list - 10&

In addition, to use faster lm querying, you must launch the lm query server:
nohup python tools/lmServer.py & (path from project root)
You can check if its running with the command curl http://0.0.0.0:9090/score

- To run tests, run "python manage.py test deobfuscate"

To switch to deployment mode run
"python deployment.py -on"
"python manage.py collectstatic"
Running "python manage.py check --deploy" will sanity check your deployment options.
"mod_wsgi-express start-server --url-alias /static static --application-type module jsnaughty.wsgi"
This command will run with higher timeouts so that we don't get gateway timeouts on longer files
"mod_wsgi-express start-server --request-timeout 600 --queue-timeout 500 --socket-timeout 600 --url-alias /static static --application-type module jsnaughty.wsgi"

To switch to development mode (localhost connections only)  run:
"python deployment.py"
"python manage.py runserver"

Note: When you update static files such as .css file, you must run:
"python manage.py collectstatic"
