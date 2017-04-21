#Basic Usage
1) Install docker
2) Run "docker pull caseycas/jsnaughty-moses"
3) Run "docker run -it caseycas/jsnaughty-moses"
4) Use the script "python experiments/renameFile.py"
	- The "-h" option will explain the options.

#Included Data and Expected Run Times
We have included 200 javascript files in the docker under the directory
"experiments/samples/stress_sample/".  These are not yet minified, so you must
use the --minify-first with the script to minify and get the renamed version of
the file.

These files are between 10 and 500 lines (once reformated by the beautifier 
component of uglifyjs), and based on our performance analysis on our machine
(can be run in the docker with "python testing/webPerformanceTests.py -local")
we obtained the following total renaming times (in seconds) on the 200 files:

`
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
  2.220   4.999   6.942   9.332  10.750  55.720 
`

However, we've observed that Moses can be quite memory intensive (the docker 
itself is 8 GB), so if you're trying to run it on a laptop, or if you have many
other processes running on your machine the times may be much slower.
If you are concerned about memory usage, use the website interface instead at 
<URL NOT YET AVAILABLE>.

Additionally, when first starting the renameFile.py script, it will start the
moses and language servers.  These may take a minute to load the phrase tables
and language models.  Subsequent runs should be much faster.

#Adding your own Javascript Files to the Docker

Instructions incoming