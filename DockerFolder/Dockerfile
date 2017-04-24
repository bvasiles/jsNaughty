FROM ubuntu:16.04

RUN apt-get update --fix-missing

RUN apt-get install -q -y \
	unzip \
	make \
	g++ \
	wget \
	git \
	mercurial \
	bzip2 \
	autotools-dev \
	automake \
	libtool \
	zlib1g-dev \
	libbz2-dev \
	libboost-all-dev \
	libxmlrpc-core-c3-dev \
	libxmlrpc-c++8-dev \
	python-dev \
	graphviz \
	imagemagick \
	cmake \
	libgoogle-perftools-dev \
	subversion \
	python-pip \
	build-essential \
	git-core \
	pkg-config \
#        node-uglify \
        curl \
        vim
RUN git clone https://github.com/moses-smt/mosesdecoder.git /home/mosesdecoder
WORKDIR /home/mosesdecoder

RUN make -f contrib/Makefiles/install-dependencies.gmake

#Try skipping this whole thing for now.
#RUN wget http://downloads.sourceforge.net/project/boost/boost/1.63.0/boost_1_63_0.tar.gz
#RUN tar zxf boost_1_63_0.tar.gz
#WORKDIR boost_1_63_0/
#RUN ./bootstrap.sh
#RUN ./b2 -j4 --prefix=$PWD -- libdir=$PWD/lib64 --layout=system link=static install || echo FAILURE

WORKDIR /home/mosesdecoder

RUN ./bjam -q --with-cmph=./opt --with-xmlrpc-c=./opt --with-mm --max-kenlm-order=5 --with-probing-pt debug-symbols=off --enable-boost=pool --max-factors=1 threading=multi variant=release -j$(getconf _NPROCESSORS_ONLN) $@

WORKDIR /home

#Install needed python libraries
RUN pip2 install --upgrade pip
RUN pip2 install numpy scipy pygments unidecode requests
RUN pip2 install https://github.com/kpu/kenlm/archive/master.zip
RUN easy_install web.py

#Extra install (move to start eventually
RUN apt-get install -q -y vim nodejs npm
RUN cp /usr/bin/nodejs /usr/bin/node
RUN npm install uglify-js -g
RUN npm install unuglify-js -g

RUN git clone https://github.com/bvasiles/jsNaughty.git jsnaughty


WORKDIR /home/jsnaughty

RUN git pull

#TODO: Need to store this somewhere for people to download.
#Paths in the .ini files are relative to where the moses command is run from.
RUN mkdir -p /home/jsnaughty/phrase-tables/no_renaming/
RUN mkdir -p /home/jsnaughty/phrase-tables/hash_def_one_renaming/
RUN mkdir -p /home/jsnaughty/phrase-tables/langmodels/

#For copy to work, the files must be in the build context (i.e. can't use .. or absolute paths)
COPY moses.no_renaming.ini /home/jsnaughty/phrase-tables/no_renaming/moses.lm2.ini
COPY moses.hash_def.ini /home/jsnaughty/phrase-tables/hash_def_one_renaming/moses.lm2.ini
COPY js.blm.lm /home/jsnaughty/phrase-tables/langmodels/js.blm.lm
COPY nr-phrase-table-pruned.minphr /home/jsnaughty/phrase-tables/no_renaming/phrase-table-pruned.minphr
COPY hd-phrase-table-pruned.minphr /home/jsnaughty/phrase-tables/hash_def_one_renaming/phrase-table-pruned.minphr
COPY startServers.sh /home/jsnaughty/startServers.sh

ENTRYPOINT ["/bin/bash"]


