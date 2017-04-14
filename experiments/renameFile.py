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
import mosesClient
from __builtin__ import str
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
                
from unicodeManager import UnicodeReader, UnicodeWriter
from tools import Uglifier

parser = argparse.ArgumentParser(description="A simple helper script to run " +
                                 "the deobfuscator on a file from the command"+
                                 " line.")

parser.add_argument("input_file",help = "Path to the file you would like to " +
                    " recover the names for.", action="store", type=str)
parser.add_argument("output_file", help = "Path to the output file where the "+
                    "renamed file is stored.", action = "store", type = str)
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

client = MosesClient("./")

#Read in file
text = open(args.input_file, 'r').read()

#Minify if necessary
if(args.minify_first):
    minifier = Uglifier()
    text = minifier.web_run(text)
    if(args.debug):
        print("------------------------Minified File-------------------------")
        print(text)
        print("--------------------------------------------------------------")

result = client.deobfuscateJS(text,args.mix,0,args.debug,True,True)

#Save to output file
with open(args.output_file, 'w') as f:
    f.write(result[0])