# jsNaughty

jsNaughty is a tool for recovering names from obfuscated Javascript files.  It is based on 
framing the deobfuscation problem as a language translation problem - we translate the 
obfuscated names to meaningful names using the context in which variables are defined.

To do this, the tool makes uses of the [Moses statistical machine translation framework](http://
www.statmt.org/moses/) to perform the translation, along with some pre and post processing to
handle code specific considerations.

# Using the tool

We are planning on providing at least two methods to use jsNaughty.  One, there will be
a web interface where you can input obfuscated javascript (currently we have only focused on 
recovering obfuscated names from the [uglifyjs](https://www.npmjs.com/package/uglifyjs) tool) 
and get the unobfuscated javascript in return.  The website is not currently online as we are 
in the middle of moving to a more permanent host, but a link will be included here shortly.

Alternatively, we have provided a docker to handle installing necessary packages and moses.
The docker currently starts a bash shell with an environment able to run the main function
used in the website "deobfuscateJS".  This function is located in experiments/mosesClient.py, 
and details about its input and output can be found in the comments.  The subdirectory 
"DockerFolder" contains the Dockerfile and running instructions are in its README file.  The 
functionality of the Dockerfile will be expanded to also have a simpler mode that imitates the 
website, allowing the passing of just a obfuscated file as an input and returning a 
deobsfuscated file.

Currently the DockerFile requires additional data (the phrase tables, .ini files, and language 
models), which are too large to host on GitHub.  These are not yet publically available, but
can be provided on request.  Eventually, these will be available and automatically downloaded
by an updated DockerFile.

# Components 

jsNaughty depends on several components to run the deobfuscation process.  The main service
relies on three servers - two instances of mosesserver and one instance on lmServer. 

The mosesserver is part of Moses smt and is used to provide the initial translation suggestions
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
website and programmatic path (via calling deobfuscateJS in experiments/mosesClient.py).  
However, it is dependant on JSNice's web service being available.  If this step fails, instead
the tool will fall back on just using our translation framework to generate names.

# Phrase-table pruning

One of the biggest slow-downs for translation is the size of the phrase table.  The phrase table 
size can be reduced via pruning; the translations with the least support can be removed, 
drastically reducing the table size while hopefully not affecting translation quality (see http:/
/www.statmt.org/moses/?n=Advanced.RuleTables#ntoc5).  We are still investigating how much the 
pruning affects our accuracy.

However if you have an uncompressed phrase table and associated corpora, you can run reduce the 
table size in the following manner (on Linux):

`
<moses-phrase-filter-path>/Bin/Linux/Index/IndexSA.O32 corpus.clear
<moses-phrase-filter-path>/Bin/Linux/Index/IndexSA.O32 corpus.ugly
nohup cat phrase-table | <moses-path>/contrib/sigtest-filter/filter-pt -e corpus.clear -f corpus.ugly -l a+e -n 30 > phrase-table.pruned &
<moses-path>/bin/processPhraseTableMin -no-alignment-info -encoding None -in phrase-table.pruned -nscores 4 -out phrase-table-pruned.minphr
`