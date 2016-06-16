bs = require("./bioseq");

// Functions on raw strings
rawseq = "GATTACATG";

rnaseq = bs.transcribe(rawseq);
bs.backTranscribe(rnaseq);

bs.complement(rawseq);
bs.reverseComplement(rawseq);
bs.letterCounts(rawseq);
bs.letterFrequencies(rawseq);
var prot = bs.translate(rawseq);
bs.translate3frames(rawseq);
bs.translate6frames(rawseq);
bs.ungap(rawseq);
var prot3 = bs.protein1to3(prot);
var prot1 = bs.protein3to1(prot3);
console.log(prot1 == prot);

// Methods on the Sequence object
myseq = bs.parseFasta(">myseq hey hey hey\n" + rawseq)[0];

myrnaseq = myseq.transcribe();
myrnaseq.backTranscribe();

// myseq.complement();
myseq.letterCounts();
myseq.letterFrequencies();
myseq.reverseComplement();
prot = myseq.translate();
myseq.translate3frames();
myseq.translate6frames();
myseq.ungap();
prot3 = prot.protein1to3(prot);

console.log(bs.toFasta(myseq));
console.log(bs.toFasta(prot));
console.log(prot3);
