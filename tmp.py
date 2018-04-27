from unicodeManager import UnicodeReader, UnicodeWriter



if __name__ == '__main__':
  files = None
  with open('problematic.txt') as in_file:
    lines = in_file.readlines()
    files = set(map(lambda x: x.split()[0].strip(), lines))
  with open('experiments/results/jsnaughty_test_set/candidates.csv') as in_file:
    reader = UnicodeReader(in_file)
    with open('experiments/results/jsnaughty_test_set/filtered_cands.csv', 'w') as out_file:
      writer = UnicodeWriter(out_file)
      for row in reader:
        if row[0].strip() in files:
          writer.writerow(row)



