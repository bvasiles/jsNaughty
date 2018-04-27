#!/usr/bin/env python
import argparse
import os
import re
from tools import Aligner, IndexBuilder, WebLexer


if __name__ == '__main__':
  argparser = argparse.ArgumentParser()
  argparser.add_argument('in_dir', type=str)
  argparser.add_argument('out_dir', type=str)
  args = argparser.parse_args()
  for _, _, files in os.walk(args.in_dir):
    for file in files:
      if re.match('[0-9]*\\.js', file):
        beautified_text = open(os.path.join(args.in_dir, file)).read()

        lex_ugly = WebLexer(beautified_text)
        # if(debug_output):
        #     print("Lex_ugly---------------------")
        #     print(lex_ugly.tokenList)
        #     print("Lex_ugly---------------------")
        iBuilder_ugly = IndexBuilder(lex_ugly.tokenList)
        with open(os.path.join(args.out_dir, file), 'wb') as out_f:
          out_f.write(iBuilder_ugly.get_text_wo_literals().encode("UTF-8"))