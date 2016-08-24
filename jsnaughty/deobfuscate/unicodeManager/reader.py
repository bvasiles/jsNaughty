import csv
from utf8Recorder import UTF8Recoder


class UnicodeReader:
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", delimiter=';', **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.reader(f, delimiter=delimiter, dialect=dialect, **kwds)

    def next(self):
        row = self.reader.next()
        return [unicode(s, "utf-8") for s in row]

    def __iter__(self):
        return self