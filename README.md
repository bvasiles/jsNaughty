# jsNaughty

jsNaughty is a tool for recovering names from obfuscated Javascript files.  It is based on 
framing the deobfuscation problem as a language translation problem - we translate the 
obfuscated names to meaningful names using the context in which variables are defined.

To do this, the tool makes uses of the [Moses statistical machine translation framework](http://
www.statmt.org/moses/) to perform the translation, along with some pre and post processing to
handle code specific considerations.

# Using the tool

We currently provide two methods to use jsNaughty.  First, you can try the tool at our
[website](http://jsnaughty.org).  You can input minified javascript (currently we have only focused on 
recovering obfuscated names from the popular [uglifyjs](https://www.npmjs.com/package/uglifyjs) tool) 
and get the renamed and reformatted javascript in return.  The website also provides a minification
tab so you can minify Javascript with uglifyjs without having to install it on your own machine.

Alternatively, we have provided a docker to handle installing necessary packages and moses.
The docker starts a bash shell with an environment able to run the scripts used in the 
website along with a helper script (experiments/renameFile.py) to allow you to run the 
renamer on a single Javascript file or on a batch.  To use this environment, pull the image
"caseycas/jsnaughty-moses" from dockerhub.  Detailed instructions on using the docker and
the sample script located in the README [here](https://github.com/bvasiles/jsNaughty/tree/master/DockerFolder).

Currently, building from the DockerFile requires additional data (the phrase tables and 
language models), which are too large to host on GitHub.  These are provided in the docker 
image, but you will need to extract them if you wish to rebuild the image yourself.

# Components 

jsNaughty depends on several components to run the deobfuscation process.  The main service
relies on three servers - two instances of mosesserver and one instance on lmServer. 

The mosesserver is part of Moses and is used to provide the initial translation suggestions
after preprocessing.  One server is used with the hashing option, and one with the original obfuscated names.  

The lmServer is used to resolve inconsistencies between translations of a variable used on 
different lines.  Moses translates each line individually, but in source code, variables must be 
named consistently within a scope.

Examples on how we run these servers can be found in DockerFolder/startServers.sh or the README 
file in the jsnaughty subdirectory (where the website code is located).  In tools/config.py are 
the definitions of how to contect to each server.

Also, during experiments, we found jsNaughty performed similarily in quality to [JSNice](
jsnice.org), but that the recovering names covered very different sets of names.  We found 
combining them created a tool more effect than either.  This option is built into both the 
website and script included in the Docker.  

However, it is dependant on JSNice's web service being available.  If this step fails, instead
the tool will fall back on just using our translation framework to generate names.

# Phrase-table pruning

One source of slow-downs during translation is the size of the phrase table.  The phrase table 
size can be reduced via pruning; the translations with the least support can be removed, 
drastically reducing the table size while hopefully not affecting translation quality (see http:/
/www.statmt.org/moses/?n=Advanced.RuleTables#ntoc5).  We are still investigating how much the 
pruning affects our accuracy - the Docker and website are using the full phrase tables.

However if you have an uncompressed phrase table and associated corpora, you can run reduce the 
table size in the following manner (on Linux):

`
<moses-phrase-filter-path>/Bin/Linux/Index/IndexSA.O32 corpus.clear
<moses-phrase-filter-path>/Bin/Linux/Index/IndexSA.O32 corpus.ugly
nohup cat phrase-table | <moses-path>/contrib/sigtest-filter/filter-pt -e corpus.clear -f corpus.ugly -l a+e -n 30 > phrase-table.pruned &
<moses-path>/bin/processPhraseTableMin -no-alignment-info -encoding None -in phrase-table.pruned -nscores 4 -out phrase-table-pruned.minphr
`
