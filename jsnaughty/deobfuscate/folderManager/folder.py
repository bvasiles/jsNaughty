import os, glob, ctypes
import fnmatch


class Folder:

    """Initialize object
    
    Keyword arguments:
    path -- absolute or relative path to folder
    """
    def __init__(self, path):
        self.path = os.path.abspath(path)
        
        
    def path(self):
        return self.path
        
        
    """Get list of full file names with extension 'ext'
    
    Keyword arguments:
    ext         -- extension string ('*.txt', '*.java')
    recursive     -- 1 (look recursively in subfolders) or 0
    """
    def fullFileNames(self, ext, recursive = None):
        if recursive is None:
            return glob.glob( os.path.join(self.path, ext) )
        else:
            listOfFiles = []
            for path, _dirs, files in os.walk(self.path):
                for _file in [os.path.abspath(os.path.join(path, filename))
                             for filename in files if fnmatch.fnmatch(filename, ext)]:
                    listOfFiles.append(_file)
            return listOfFiles
        
        
    """Get list of base file names with extension 'ext'
    
    Keyword arguments:
    ext         -- extension string ('*.txt', '*.java')
    recursive     -- 1 (look recursively in subfolders) or 0
    """
    def baseFileNames(self, ext, recursive = None):
        listOfFiles = []

        if recursive is None:
            files = glob.glob( os.path.join(self.path, ext) )
            for _file in files:
                listOfFiles.append(os.path.basename(_file))
        else:
            for path, _dirs, files in os.walk(self.path):
                for _file in [os.path.abspath(os.path.join(path, filename))
                             for filename in files if fnmatch.fnmatch(filename, ext)]:
                    listOfFiles.append(os.path.basename(_file))
            
        return listOfFiles
            

    def create(self):
        """Create a new folder if it does not already exist
        """
        if not (os.path.isdir(self.path)):
            os.system("mkdir %s" % self.path)
        return self.path
            
            
    def subfolders(self):
        return [ name for name in os.listdir(self.path) if os.path.isdir(os.path.join(self.path, name)) ]
        

    def subfoldersNoHidden(self):
    
        def has_hidden_attribute(filepath):
            try:
                attrs = ctypes.windll.kernel32.GetFileAttributesW(unicode(filepath))
                assert attrs != -1
                result = bool(attrs & 2)
            except (AttributeError, AssertionError):
                result = False
            return result
    
        listdir = os.listdir(self.path)
        onlyDirs = []
        for l in listdir:
            fullname = os.path.join(self.path, l)
            if os.path.isdir(fullname):
                if not has_hidden_attribute(fullname):
                    onlyDirs.append(l)
        return onlyDirs

