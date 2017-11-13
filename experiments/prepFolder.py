import sys
import os
import shutil
import glob


def mkdir(pth):
    if not (os.path.isdir(pth)):
        os.system("mkdir %s" % pth)


root_path = os.path.abspath(sys.argv[1])

corpus_files = [os.path.basename(f) \
                    for f in glob.glob(os.path.join(root_path, "*.js")) \
                    if os.path.basename(f).startswith("corpus.") and \
                        os.path.basename(f) != "corpus.orig.js"]

suffixes = [f[7:-3] for f in corpus_files]

lengths = []

print(corpus_files)

for idx, suffix in enumerate(suffixes):
    
    variant = "train." + suffix
    
    # Create subfolder structure
    mkdir(os.path.join(root_path, variant))
    mkdir(os.path.join(root_path, variant, "corpus"))
    mkdir(os.path.join(root_path, variant, "model"))

    # Populate with clear and minified corpora
    if idx == 0:
        corpus_clear = open(os.path.join(root_path, \
                                         "corpus.orig.js"), "r").readlines()
        with open(os.path.join(root_path, \
                               variant, \
                               "corpus", \
                               "corpus.clear"), "w") as f:
            
            # Remove empty lines and lines longer than 20 tokens
            simplified = [line for line in corpus_clear \
                    if len(line.split())>0 and len(line.split())<=20]
            
            lengths.append(len(simplified))
            f.writelines(simplified)
                
    else:
        # No need to do the processing each time for the clear corpus.
        # Just copy one over
        src = os.path.join(root_path, "train."+suffixes[0], \
                           "corpus", "corpus.clear")
        dst = os.path.join(root_path, variant, "corpus", "corpus.clear")
        shutil.copy(src, dst)
        
    # The minified variants are all different
    corpus_ugly = open(os.path.join(root_path, \
                                     "corpus."+suffix+".js"), "r").readlines()
    
    with open(os.path.join(root_path, variant, \
                           "corpus", "corpus.ugly"), "w") as f:
        
        simplified = [line for line in corpus_ugly \
                if len(line.split())>0 and len(line.split())<=20]
        
        lengths.append(len(simplified))
        f.writelines(simplified)

print(lengths)
        
assert len(set(lengths)) == 1

# Produce alignment files
for idx, suffix in enumerate(suffixes):
    
    variant = "train." + suffix
    
    corpus_clear = open(os.path.join(root_path, variant, \
                           "corpus", "corpus.clear"), "r").readlines()
                        
    corpus_ugly = open(os.path.join(root_path, variant, \
                            "corpus", "corpus.ugly"), "r").readlines()

    aligned = open(os.path.join(root_path, variant, \
                            "model", "aligned.intersect"), "w")

    for idx, line in enumerate(corpus_ugly):
        orig_line = corpus_clear[idx]
        
        assert len(orig_line.split()) == len(line.split())
        
        mapping = ""
        for tidx in range(len(orig_line.split())):
            mapping += " %d-%d" % (tidx,tidx)
            
        aligned.write(mapping.strip() + "\n")


