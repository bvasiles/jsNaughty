"""
Script to make sense of moses debug output
to make sense of the performance issues.
"""

def parseCostLine(text):
    pieces = text.split()
    return (int(pieces[3]), int(pieces[5]))

fc_files = {}
file_id = 0
fc_files[file_id] = {}
nonZero = False
i = 0
#Future cost
with open("fc.out", "r") as f:
    for line in f:
        #if(i > 20):
        #    break
        i+=1
        #if(True):
        try:
            (id_from, id_to) = parseCostLine(line)
        except:
            continue
        if(id_from == 0 and nonZero):
            nonZero = False
            file_id += 1
            fc_files[file_id] = {}
        else:
            if(id_from in fc_files[file_id]):
                fc_files[file_id][id_from] += 1
            else:
                fc_files[file_id][id_from] = 1

        if(id_from != 0):
            nonZero = True

for file_id, idsDict in fc_files.iteritems():
    print("file_id: " + str(file_id))
    print(" ".join([str(line) + ":" + str(ref)   for line, ref in idsDict.iteritems()]))
