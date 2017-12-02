import sys
import os
import argparse
import csv
import ntpath

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))

from folderManager import Folder

def copyTopNLines(in_name, out_name, lines):
    with open(in_name, 'r') as f_in:
        with open(out_name, 'w') as f_out:
          i = 0
          for line in f_in:
              i += 1
              f_out.write(line)
              if(i >= lines):
                break

    return True

parser = argparse.ArgumentParser()
parser.add_argument("-s", "--source_dir",action="store", type=str,
    help="The source directory where the files are stored.")
parser.add_argument("-o", "--output_dir",action="store", type=str,
    help="Where to put the output files.")
parser.add_argument("-lines",action="store", type=int, default = 0, 
    help="How many lines to take from the file ")

args = parser.parse_args()

output_path = os.path.abspath(args.output_dir)
source_path = os.path.abspath(args.source_dir)
output_folder = Folder(output_path).create()
lines = args.lines

clean_in = os.path.join(source_path, "corpus.clear")
ugly_in = os.path.join(source_path, "corpus.ugly")

clean_out = os.path.join(output_path, "corpus.clear")
ugly_out = os.path.join(output_path, "corpus.ugly")

copyTopNLines(clean_in, clean_out, lines)
copyTopNLines(ugly_in, ugly_out, lines)
