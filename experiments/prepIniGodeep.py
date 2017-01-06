import sys
import os
import glob

root_path = os.path.abspath(sys.argv[1])

corpus_files = [os.path.basename(f) \
                    for f in glob.glob(os.path.join(root_path, "*.js")) \
                    if os.path.basename(f).startswith("corpus.") and \
                        os.path.basename(f) != "corpus.orig.js"]

suffixes = [f[7:-3] for f in corpus_files]

for idx, suffix in enumerate(suffixes):
    
    variant = "train." + suffix
    
    moses_ini = open(os.path.join(root_path, variant, \
                                  "model", "moses.ini"), "r").readlines()
    
    idx_distortion = moses_ini.index("[distortion-limit]\n") + 1
    moses_ini[idx_distortion] = "0\n"
    
    
#     idx_unk = moses_ini.index("UnknownWordPenalty\n")
#     moses_ini[idx_unk] = "#UnknownWordPenalty\n"
    idx_unk = moses_ini.index("UnknownWordPenalty0= 1\n")
    moses_ini[idx_unk] = "UnknownWordPenalty0= 0\n"
    
    
#     idx_wp = moses_ini.index("WordPenalty\n")
#     moses_ini[idx_wp] = "#WordPenalty\n"
    idx_wp = moses_ini.index("WordPenalty0= -1\n")
#     moses_ini[idx_wp] = "WordPenalty0= 0.0113015\n"
    moses_ini[idx_wp] = "WordPenalty0= 0\n"
    
    
#     idx_wp = moses_ini.index("Distortion\n")
#     moses_ini[idx_wp] = "#Distortion\n"
    idx_wp = moses_ini.index("Distortion0= 0.3\n")
#     moses_ini[idx_wp] = "Distortion0= 0.0272844\n" #"Distortion0= 0\n"
    moses_ini[idx_wp] = "Distortion0= 0\n"
    
#     idx_wp = moses_ini.index("LM0= 0.5\n")
#     moses_ini[idx_wp] = "LM0= 0.137444\n"
    
#     idx_wp = moses_ini.index("PhrasePenalty0= 0.2\n")
#     moses_ini[idx_wp] = "PhrasePenalty0= -0.449541\n"
    
#     idx_wp = moses_ini.index("TranslationModel0= 0.2 0.2 0.2 0.2\n")
#     moses_ini[idx_wp] = "TranslationModel0= 0.0280461 0.0140369 0.26206 0.0702867\n"
    
    
    l_phr_dict = [l for l in moses_ini \
                  if l.startswith("PhraseDictionaryMemory")][0]
    idx_phr_dict = moses_ini.index(l_phr_dict)
    parts = l_phr_dict.split()
    
    updated_parts = ["PhraseDictionaryCompact"] + \
                    parts[1:3] + \
                    [parts[3].replace("phrase-table.gz","phrase-table.minphr").replace("/home/bogdanv/","/data/bogdanv/").replace("/home/bogdan/","/data/bogdanv/")] + \
                    parts[4:6]
    moses_ini[idx_phr_dict] = " ".join(updated_parts) + "\n"
    
    
    l_lm = [l for l in moses_ini \
                  if l.startswith("KENLM")][0]
    idx_lm = moses_ini.index(l_lm)
    moses_ini[idx_lm] = l_lm.replace("/home/bogdanv/","/data/bogdanv/").replace("/home/bogdan/","/data/bogdanv/") + "\n"
    
    with open(os.path.join(root_path, variant, \
                           "model", "moses.bin.ini"), "w") as f:
        f.writelines(moses_ini)
    

# Distortion0= 0.0272844
# LM0= 0.137444
# UnknownWordPenalty0= 0
# WordPenalty0= 0.0113015
# PhrasePenalty0= -0.449541
# TranslationModel0= 0.0280461 0.0140369 0.26206 0.0702867
# 
# Distortion0= 0.3
# LM0= 0.5
# UnknownWordPenalty0= 1
# WordPenalty0= -1
# PhrasePenalty0= 0.2
# TranslationModel0= 0.2 0.2 0.2 0.2

