import os
import random

import sys
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))

from folderManager import Folder
from unicodeManager import UnicodeReader, UnicodeWriter 

corpus_dir = Folder(sys.argv[1])

isMini = {}
reader = UnicodeReader(open('isMinified.csv', 'r'))
for row in reader:
    isMini[row[0]] = bool(row[1])
    print row[0], isMini[row[0]]

eligible = [os.path.basename(f) for f in corpus_dir.fullFileNames("*.js")
            if not isMini.get(os.path.basename(f), False)]

size = len(eligible)
tt = int(0.8 * size)
training_size = int(0.9 * tt)
tuning_size = int(tt - training_size)
testing_size = size - tt

print 'Total:', size
print 'Training:', training_size
print 'Tuning:', tuning_size
print 'Testing:', testing_size

training_sample = random.sample(eligible, training_size)
with open('trainingSample.csv', 'wb') as of:
    writer = UnicodeWriter(of)
    for f in training_sample:
        writer.writerow([f])


tuning_sample = random.sample([f for f in eligible 
                               if f not in training_sample], 
                              tuning_size)
with open('tuningSample.csv', 'wb') as of:
    writer = UnicodeWriter(of)
    for f in tuning_sample:
        writer.writerow([f])


testing_sample = random.sample([f for f in eligible 
                               if f not in training_sample
                               and f not in tuning_sample], 
                              testing_size)
with open('testingSample.csv', 'wb') as of:
    writer = UnicodeWriter(of)
    for f in testing_sample:
        writer.writerow([f])

