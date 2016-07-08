import os
import sys
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
import random
from unicodeManager import UnicodeReader, UnicodeWriter 


file_in = os.path.abspath(sys.argv[1])
file_out = os.path.abspath(sys.argv[2])
size = int(sys.argv[3])

data = []
reader = UnicodeReader(open(file_in, 'r'))
for row in reader:
    data.append(row[0])

data_sample = random.sample(data, size)

with open(file_out, 'w') as of:
    writer = UnicodeWriter(of)
    for f in data_sample:
        writer.writerow([f])
 
