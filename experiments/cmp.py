'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))

from unicodeManager import UnicodeReader, UnicodeWriter

pth_f1 = os.path.abspath(sys.argv[1])
pth_f2 = os.path.abspath(sys.argv[2])

d1 = {}
with open(pth_f1, 'r') as f1:
    reader = UnicodeReader(f1)
    for row in reader:
        d1[tuple(row[:7])] = row[8]
    

d2 = {}
with open(pth_f2, 'r') as f2:
    reader = UnicodeReader(f2)
    for row in reader:
        d2[tuple(row[:7])] = row[8]
    
for k, v in d2.iteritems:
    if v != d1[k]:
        print k, v, d1[k]

