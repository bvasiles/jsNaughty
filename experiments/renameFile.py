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
import argparse
import ntpath
from  mosesClient import MosesClient
from serverChecker import checkMosesServers
from __builtin__ import str
import subprocess
PIPE = subprocess.PIPE
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
from unicodeManager import UnicodeReader, UnicodeWriter
from folderManager import Folder
from tools import Uglifier


checkTime = 30 #Look every 20 seconds..

def startServers():
    proc = subprocess.Popen(["sh", "/home/jsnaughty/startServers.sh"], stderr=PIPE, stdout=PIPE)
    _pc = proc.communicate()
    return proc.returncode

def processFile(input, output, args):
    #Read in file
    text = open(input, 'r').read()
    
    #Minify if necessary
    if(args.minify_first):
        minifier = Uglifier()
        (ok, text, msg) = minifier.web_run(text)
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
                    "directory", action="store", type=str)
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
                    "recover names.", action = "store_true")
parser.add_argument("--debug", help = "Run in debug mode, printing out "+
                    "intermediate information.  Also prints the minified "+
                    "file to standard out if the \'--minify-first\' flag " +
                    "is also enabled.", action = "store_true")

args = parser.parse_args()

client = MosesClient("/home/jsnaughty/")
moses_url_dict = {}
moses_url_dict[40021] = "http://localhost:40021/RPC2"
moses_url_dict[40022] = "http://localhost:40022/RPC2"

#Make sure the servers are up and running.
while(True):
    if(args.debug):
         print("Trying to start servers...")
    mosesFail = False
    #Ping moses Servers
    mosesStatus = checkMosesServers(moses_url_dict) #Eventually turn into list of failed servers
    #Do a simple kill and restart for the moment (can change to something more selective later).
    if(debug):
        print(mosesStatus)
    for port, status in mosesStatus.iteritems():
        if(status == "E" or status == "F"):
            mosesFail = True
            break
        
    if(args.debug):
        print(mosesFail)
#    break
    if(mosesFail):
        startServers()
    else: #Start renaming now that the servers are online.
        if(args.debug):
            print("Servers are online.")
        break
    #Wait for awhile
    time.sleep(checkTime)


if(args.batch):
        inputFolder = Folder(os.path.abspath(args.input))
        fileList = inputFolder.fullFileNames("*.js", recursive=False)  
        for next_file in fileList:
            base_file = ntpath.basename(next_file)
            output_file = \
                os.path.join(args.output,
                    base_file[:base_file.rfind(".")] + ".out.js")
            processFile(next_file, output_file ,args)
else:
    processFile(args.input, args.output, args)
