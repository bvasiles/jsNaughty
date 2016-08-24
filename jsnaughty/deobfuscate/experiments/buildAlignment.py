import sys
import os

root_path = os.path.abspath(sys.argv[1])

corpus_clear = open(os.path.join(root_path, 'corpus.clear'), 'r').readlines()
corpus_ugly = open(os.path.join(root_path, 'corpus.ugly'), 'r').readlines()

aligned = open(os.path.join(root_path, '../model', 'aligned.intersect'), 'w')

for idx, line in enumerate(corpus_ugly):
    orig_line = corpus_clear[idx]
    
    assert len(orig_line.split()) == len(line.split())
    
    mapping = ''
    for tidx in range(len(orig_line.split())):
        mapping += ' %d-%d' % (tidx,tidx)
        
    aligned.write(mapping.strip() + '\n')
