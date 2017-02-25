Web framework for javascript deobfuscation tool.
While running, make sure the moses server pointed to by deobfuscate/experiments/mosesClient.py
	is running
	- E.g. "/home/ccasal/mosesdecoder/bin/mosesserver -f /data/bogdanv/deobfuscator/experiments/corpora/corpus.concat/train.no_renaming/tuning/moses.ini -n-best-list - 10"
	- You will want to background this with additional options (To be added), if you want the
	server to run more robustly.
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
"mod_wsgi-express start-server --request-timeout 1000 --queue-timeout 900 --socket-timeout 1000 --url-alias /static static --application-type module jsnaughty.wsgi"

To switch to development mode (localhost connections only)  run:
"python deployment.py"
"python manage.py runserver"

Note: When you update static files such as .css file, you must run:
"python manage.py collectstatic"
