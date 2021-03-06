import sys
import os
import ntpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from folderManager.folder import Folder

def getFileId(filename):
    '''
    Given a file path of the form [/.../.../]<num>.<exts>
    Return <num>
    Assumes there are no "/" in <exts>, but may be "." in the directory path if its included.
    '''
    base = ntpath.basename(filename)
    return int(base[:base.find(".")])


inputFile = sys.argv[1]

fileIds = set()



testDir = Folder("/home/ccasal/jsnaughty/testing/consistencyFailureFiles/")
#print(testDir.baseFileNames("*.js"))
#fileIds = set([getFileId(nextFile) for nextFile in testDir.baseFileNames("*.js")])

with open(inputFile, 'r') as f:
    for line in f:
        #files.append(line.split(")")[0].replace("(", "."))
        fileIds.add(int(line.split("(")[0]))


print(fileIds)

renamings = ["hash_def_one_renaming", "no_renaming"]
consistency = ["", "freqlen", "lmdrop", "lm"]


with open("/home/ccasal/jsnaughty/testing/copyFailures.sh", 'w') as f:
    for fileId in fileIds:
        f.write("cp /data/bogdanv/deobfuscator/experiments/results/sample.test.10k.v10/" + str(fileId) + ".js" + " /home/ccasal/jsnaughty/testing/consistencyFailureFiles/\n")
        f.write("cp /data/bogdanv/deobfuscator/experiments/results/sample.test.10k.v10/" + str(fileId) + ".u.js" + " /home/ccasal/jsnaughty/testing/consistencyFailureFiles/\n")
        for r in renamings:
            for c in consistency:
                if(c != ""):
                    ending = "." + r + "." + c + ".js"
                else:
                    ending = "." + r + ".js"

                f.write("cp /data/bogdanv/deobfuscator/experiments/results/sample.test.10k.v10/" + str(fileId) + ending + " /home/ccasal/jsnaughty/testing/consistencyFailureFiles/\n")
