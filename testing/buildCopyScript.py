files = []
fileIds = set()

with open("/home/ccasal/jsnaughty/testing/consistencyFailures.txt", 'r') as f:
    for line in f:
        files.append(line.split(")")[0].replace("(", "."))
        fileIds.add(int(line.split("(")[0]))

renamings = ["hash_def_one_renaming", "no_renaming"]
consistency = ["", "freqlen", "lmdrop", "lm"]


with open("/home/ccasal/jsnaughty/testing/copyFailures.sh", 'w') as f:
    for fileId in fileIds:
        f.write("cp /data/bogdanv/deobfuscator/experiments/results/sample.test.10k.v7/" + str(fileId) + ".js" + " ./consistencyFailureFiles/\n")
        f.write("cp /data/bogdanv/deobfuscator/experiments/results/sample.test.10k.v7/" + str(fileId) + ".u.js" + " ./consistencyFailureFiles/\n")


    for nextFile in files:
        f.write("cp /data/bogdanv/deobfuscator/experiments/results/sample.test.10k.v7/" + nextFile + " ./consistencyFailureFiles/\n")
