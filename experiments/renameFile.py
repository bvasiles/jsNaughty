"""
An front end for running the deobsfuscateJS function.

Provides two main running modes - one that takes an obfuscated JS file and
returns it with renamed variables (and reformatted).  Or it takes a normal
JS file and then minifies it with uglifyJS and then recovers with new
names (and prints both to standard out)

@author: Casey Casalnuovo
"""
import sys
import os
import time
import argparse
import ntpath
from  mosesClient import MosesClient
from serverManagementFunctions import *
from __builtin__ import str
import subprocess
PIPE = subprocess.PIPE
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
from unicodeManager import UnicodeReader, UnicodeWriter
from folderManager import Folder
from tools import Uglifier


checkTime = 15 #Look every 15 seconds...

def startServers():
    os.system("sh /home/jsnaughty/startServers.sh")
    #f = open("server.log", 'w')
    #print("A")
    #proc = subprocess.Popen(["sh", "/home/jsnaughty/startServers.sh"], stderr=f, stdout=f)
    #print("B")
    #_pc = proc.communicate()
    #print("C") 
    #f.close()
    #print("D")
    return True

def processFile(input, output, args):
    #Read in file
    text = open(input, 'r').read()
    
    #Minify if necessary
    if(args.minify_first):
        minifier = Uglifier()
        (ok, text, msg) = minifier.web_run(text)
        if(output.endswith(".out.js")):
            min_file = output[:-7] + ".min.js"
        elif(output.endswith(".js")):
            min_file = output[:-3] + ".min.js"
        else:
            min_file = output + ".min.js"
        
        open(min_file, 'w').write(text) 
        if(args.debug):
            print("------------------------Minified File-------------------------")
            print(text)
            print("--------------------------------------------------------------")
        if(not ok):
            print("Uglifiy failed to minify " + args.input_file)
            print("Message:")
            print(msg)
            quit() #TODO change to continue for batch files.
    
    
    result = client.deobfuscateJS(text,args.mix,0,args.debug,True,True)

    #Save to output file
    with open(output, 'w') as f:
        f.write(result[0])


parser = argparse.ArgumentParser(description="A simple helper script to run " +
                                 "the deobfuscator on a file from the command"+
                                 " line.")

parser.add_argument("input",help = "Path to the file you would like to " +
                    " recover the names for. In batch modew this is a " +
                    "directory.", action="store", type=str)
parser.add_argument("output", help = "Path to the output file where the "+
                    "renamed file is stored. In batch mode this is a " + 
                    "directory.", action = "store", type = str)
parser.add_argument("--batch", help = "Instead of processing one file at a " +
                    "time, take a file containing a list of file paths and " +
                    "process each of them.  In this mode, input becomes"+
                    " a directory with the files you wish to process, and" +
                    " output becomes a directory where you want to put the " +
                    "output files.  These files will have the same name as "+
                    "your input files, except the extension will be " +
                    "\'/out.js\' instead of \'.js\'", action="store_true")
parser.add_argument("--mix", help = "Optional argument designating that " +
                    "you would like to use the JSNice mixing option.",
                    action = "store_true")
parser.add_argument("--minify-first", help = "Optional argument " +
                    "designating that the input file is not minified. "+
                    "The tool will first run uglifyJS on the file, and then " +
                    "recover names. If this option is enabled, then also " +
                    "save a version of the minified file with a \'.min.js\' "+
                    "externsion.  In batch mode, we save a minified file for "+
                    "each input file.", action = "store_true")
parser.add_argument("--debug", help = "Run in debug mode, printing out "+
                    "intermediate information.  Also prints the minified "+
                    "file to standard out if the \'--minify-first\' flag " +
                    "is also enabled.", action = "store_true")

args = parser.parse_args()

client = MosesClient("/home/jsnaughty/")
moses_url_dict = {}
moses_url_dict[40021] = "http://localhost:40021/RPC2"
moses_url_dict[40022] = "http://localhost:40022/RPC2"

mosesStatus = checkMosesServers(moses_url_dict) #Eventually turn into list of failed servers
#Do a simple kill and restart for the moment (can change to something more selective later).
print("Checking if servers online.  If they are offline, it may take a minute")
print("for the phrase tables to load.")
if(args.debug):
    print(mosesStatus)

startup = False
for port, status in mosesStatus.iteritems():
    if(status == "E" or status == "F"):
        startServers()
        startup = True

if(startup):
    while(True):
        time.sleep(checkTime)
        mosesFail = False
        mosesStatus = checkMosesServers(moses_url_dict) #Eventually turn into list of failed servers
        #Do a simple kill and restart for the moment (can change to something more selective later).
        if(args.debug):
            print(mosesStatus)
        for port, status in mosesStatus.iteritems():
            if(status == "E" or status == "F"):
                mosesFail = True

        if(not mosesFail): #Stop checking once the servers are online.
            break

print("Servers are online.")

if(args.batch):
        inputFolder = Folder(os.path.abspath(args.input))
        fileList = inputFolder.fullFileNames("*.js", recursive=False)  
        for next_file in fileList:
            print("Renaming " + str(next_file))
            base_file = ntpath.basename(next_file)
            output_file = \
                os.path.join(args.output,
                    base_file[:base_file.rfind(".")] + ".out.js")
            processFile(next_file, output_file ,args)
else:
    print("Renaming " + str(args.input))
    processFile(args.input, args.output, args)
