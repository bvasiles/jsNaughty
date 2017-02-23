import os
import sys
from scipy.odr.odrpack import Output
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from unicodeManager import UnicodeReader, UnicodeWriter
from evalRenamingHelper import *


try:
    csv_path = os.path.abspath(sys.argv[1])
    output_path = os.path.abspath(sys.argv[2])
except:
    print("usage: python evalRenamings.py csv_in csv_out")
    quit()


reader = UnicodeReader(open(csv_path))
writer = UnicodeWriter(open(output_path, 'w'))

nextID = 0
IDMap = {}

for row in reader:
    #Also, let's create an id based on file, name's line num and location (definition)
    file = row[0]
    orig = row[1]
    line_num = row[4]
    token_pos = row[5]
    suggestion = row[6]
    js_nice_name = row[7]
    IDKey = (file, line_num, token_pos)
    if(IDKey in IDMap):
        rowID = IDMap[IDKey]
    else:
        rowID = nextID
        nextID += 1
        IDMap[IDKey] = rowID
    
    (case_insen, nonSpec, contains, abbrev) = suggestionApproximateMatch([suggestion], orig)
    (m1, m2, m3, m4) = suggestionApproximateMatch([js_nice_name], orig)
    any = case_insen or nonSpec or contains or abbrev
    n2p_any = m1 or m2 or m3 or m4
    writer.writerow(row + [n2p_any, any, case_insen, nonSpec, contains, abbrev, rowID])