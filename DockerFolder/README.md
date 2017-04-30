# Basic Usage
1) Install docker
2) Run "docker pull caseycas/jsnaughty-moses"
3) Run "docker run -it caseycas/jsnaughty-moses"
4) Use the script "python experiments/renameFile.py"
	- The "-h" option will explain the options.

# Included Data and Expected Run Times
We have included 200 javascript files in the docker under the directory
"experiments/samples/stress_sample/".  These are not yet minified, so you must
use the --minify-first with the script to minify and get the renamed version of
the file.

These files are between 10 and 500 lines (once reformated by the beautifier 
component of uglifyjs), and based on our performance analysis on our machine
(can be run in the docker with "python testing/webPerformanceTests.py -local")
we obtained the following total renaming times (in seconds) on the 200 files:

```
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
  2.220   4.999   6.942   9.332  10.750  55.720 
```

However, we've observed that Moses can be quite memory intensive (the docker 
itself is 8 GB), so if you're trying to run it on a laptop, or if you have many
other processes running on your machine the times may be much slower.
If you are concerned about memory usage, use the website interface instead at 
<URL NOT YET AVAILABLE>.

Additionally, when first starting the renameFile.py script, it will start the
moses and language servers.  These may take a minute to load the phrase tables
and language models.  Subsequent runs should be much faster.

# Adding your own Javascript Files to the Docker

To move file into the docker, first start up the docker with the command:

`
docker run -it caseycas/jsnaughty-moses
`

Then, on your host machine, run "docker ps".  This will list the currently
running docker containers and will look something like this:

```
CONTAINER ID        IMAGE                      COMMAND             CREATED             STATUS              PORTS               NAMES
45e85f1b3131        caseycas/jsnaughty-moses   "/bin/bash"         43 seconds ago      Up 42 seconds                           condescending_hawking
...
```

To copy whatever file or directory you wish to test into the docker use:

```
docker cp <path_on_host> <container_name>:<path_on_docker>
```

So, if we wanted to copy some file "test.js" in our current directory to the
beginning working directory of the docker with the name "condescending_hawking",
we would run:

```
docker cp test.js condescending_hawking:/home/jsnaughty/test.js
```

# Building the Docker from scratch (Advanced)
If you have copies of the phrase tables and language models in the 
"DockerFolder" directory, you can rebuild the docker file.  If you don't have
these files, you can copy them from a running version of the docker, similar to
the procedure described in the previous section (make sure to replace the name
of the container with yours):

```
docker cp condescending_hawking:/home/jsnaughty/phrase-tables/hash_def_one_renaming/* ./
docker cp condescending_hawking:/home/jsnaughty/phrase-tables/no_renaming/* ./
docker cp condescending_hawking:/home/jsnaughty/phrase-tables/langmodels/* ./
```

Then, if you have docker-compose installed in addition to docker, you can build
the image with "docker-compose build".

As a note, the success of this build depends on many different packages, so it
is possible for it to fail if any packages are missing.  It is preferred to 
simply use the image pulled from DockerHub.