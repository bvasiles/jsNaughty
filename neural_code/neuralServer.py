#!/usr/bin/env python
 # -*- coding: utf-8 -*-
import web #easy_install web.py
import sys
import kenlm #sudo pip install https://github.com/kpu/kenlm/archive/master.zip
import json
import os

from evaluate import web_setUp
from evaluate import web_predict

lm_path = './langmodels/js.blm.lm'
port = 9092

sys.stderr.write("Loading language model from %s..." % lm_path)
lm = kenlm.LanguageModel(lm_path)
sys.stderr.write("Done.\n")
urls = ('/evaluate', 'evaluate', '/score', 'score')

# model = web_setUp()

class MyApplication(web.application): 
    def run(self, port=8080, *middleware): 
        func = self.wsgifunc(*middleware)
        return web.httpserver.runsimple(func, ('0.0.0.0', port))

app = MyApplication(urls, globals())

class score:

    def get_scores(self, queries):
        #Bos and eos should be false if we want to not have <s> and </s>
        #wrapper tags.  Whether or not this is a correct choice should be
        #revisited later.
        return [lm.score(q, bos = False, eos = False) for q in queries]

    def GET(self):
        i = web.input(_unicode=False)
        queries = [q.strip() for q in i.q.split('|')]
        return '\n'.join('%0.4f' % s for s in self.get_scores(queries))

    def POST(self):
        return self.GET()

class evaluate:

    def GET(self):
        i = web.input(_unicode=False)
        output = web_predict(model, i.q)
        return " ".join(output)

    def POST(self):
        return self.GET()

if __name__ == '__main__':
    app.run(port=port)
