import sys

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, 'r') as f:
    with open(output_file, 'w') as f2:
        for line in f:
            f2.write(line[line.find("LM DEBUG LINE:") + len("LM DEBUG LINE:"):])
