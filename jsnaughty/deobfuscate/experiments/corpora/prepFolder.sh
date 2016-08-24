pth=$1

mkdir "$pth/train.no_renaming"
mkdir "$pth/train.hash_renaming"
mkdir "$pth/train.basic_renaming"
mkdir "$pth/train.hash_def_one_renaming"
mkdir "$pth/train.hash_def_two_renaming"

mkdir "$pth/train.no_renaming/corpus"
mkdir "$pth/train.hash_renaming/corpus"
mkdir "$pth/train.basic_renaming/corpus"
mkdir "$pth/train.hash_def_one_renaming/corpus"
mkdir "$pth/train.hash_def_two_renaming/corpus"

mkdir "$pth/train.no_renaming/model"
mkdir "$pth/train.hash_renaming/model"
mkdir "$pth/train.basic_renaming/model"
mkdir "$pth/train.hash_def_one_renaming/model"
mkdir "$pth/train.hash_def_two_renaming/model"

cp "$pth/corpus.orig.js" "$pth/train.no_renaming/corpus/corpus.clear"
cp "$pth/corpus.no_renaming.js" "$pth/train.no_renaming/corpus/corpus.ugly"
python ../buildAlignment.py $pth/train.no_renaming/corpus

cp "$pth/corpus.orig.js" "$pth/train.basic_renaming/corpus/corpus.clear"
cp "$pth/corpus.basic_renaming.js" "$pth/train.basic_renaming/corpus/corpus.ugly"
python ../buildAlignment.py $pth/train.basic_renaming/corpus

cp "$pth/corpus.orig.js" "$pth/train.hash_renaming/corpus/corpus.clear"
cp "$pth/corpus.hash_renaming.js" "$pth/train.hash_renaming/corpus/corpus.ugly"
python ../buildAlignment.py $pth/train.hash_renaming/corpus

cp "$pth/corpus.orig.js" "$pth/train.hash_def_one_renaming/corpus/corpus.clear"
cp "$pth/corpus.hash_def_one_renaming.js" "$pth/train.hash_def_one_renaming/corpus/corpus.ugly"
python ../buildAlignment.py $pth/train.hash_def_one_renaming/corpus

cp "$pth/corpus.orig.js" "$pth/train.hash_def_two_renaming/corpus/corpus.clear"
cp "$pth/corpus.hash_def_two_renaming.js" "$pth/train.hash_def_two_renaming/corpus/corpus.ugly"
python ../buildAlignment.py $pth/train.hash_def_two_renaming/corpus

