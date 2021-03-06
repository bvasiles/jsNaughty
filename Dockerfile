FROM ubuntu:16.04

RUN apt-get update
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
        node-uglify

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

RUN git clone https://github.com/bvasiles/jsNaughty.git jsnaughty

WORKDIR /home/jsNaughty

#TODO: Need to store this somewhere for people to download.
#Paths in the .ini files are relative to where the moses command is run from.
RUN mkdir phrase-tables
COPY ~/jsnaughty/phrase-tables phrase-tables

#Install needed python libraries
RUN pip2 install --upgrade pip
RUN pip2 install numpy scipy pygments unidecode
RUN pip2 install https://github.com/kpu/kenlm/archive/master.zip
RUN easy_install web



#Run tests (Just do this interactively I guess)
#RUN nohup python experiments/
#RUN nohup python experiments/serverChecker.py &
#RUN python ./testing/webPerformanceTests.py

