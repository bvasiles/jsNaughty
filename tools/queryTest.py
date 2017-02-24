from lmQuery import LMQuery
q = LMQuery("/data/bogdanv/deobfuscator/experiments/corpora/corpus.lm.500k/js.blm.lm")
q.queryServer("return n(this.x, r.x, t) && n(this.y, r.y, t);")
q.queryServer(["this.x = 10;", "return n(this.x, r.x, t) && n(this.y, r.y, t);"])
