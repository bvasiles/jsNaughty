import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from unicodeManager import UnicodeReader, UnicodeWriter
import multiprocessing
from tools import ScopeAnalyst
                    

def processFile(l):
    
    js_file_name = l
    
    candidates = []
        
    try:
        scopeAnalyst = ScopeAnalyst(os.path.join(results_path, 
                                                 js_file_name))
        nameOrigin = scopeAnalyst.nameOrigin
        for (name, def_scope) in nameOrigin.iterkeys():
            candidates.append( (def_scope, name) )
    except:
        return (js_file_name, None, 'ScopeAnalyst fail')
    
    return (js_file_name, 'OK', candidates)
        



csv_path = os.path.abspath(sys.argv[1])
results_path = os.path.abspath(sys.argv[2])
num_threads = int(sys.argv[3])

data = {}

reader = UnicodeReader(open(csv_path))
for row in reader:
    file_name = row[0]
    strategy = row[1]
    scope = row[2]
    translated_name = row[3]
    ugly_name = row[4] if len(row[4]) else None
    candidates = row[5] if len(row[5]) else None
    
    data.setdefault(file_name, {})
    data[file_name].setdefault(strategy, {})
    data[file_name][strategy].setdefault(scope, [])
    
    data[file_name][strategy][scope].append( (translated_name, 
                                              ugly_name, 
                                              candidates) )
    
    
print len(data.keys()), 'files'

wo = [k for k,v in data.iteritems() if len(v.keys())==2]
print len(wo), 'w/o Moses'

w = [k for k,v in data.iteritems() if len(v.keys())==17]
print len(w), 'w Moses'

print len(data.keys()) - wo - w, 'unaccounted for'
 

orig = {}

pool = multiprocessing.Pool(processes=num_threads)
      
for result in pool.imap_unordered(processFile, w[:1]):
    if result[1] is not None:
        file_name, ok, candidates = result
        
        orig.setdefault(file_name, {})

        for (def_scope, name) in candidates:
            orig[file_name].setdefault(def_scope, [])
            orig[file_name][def_scope].append(name)
    
    else:
        print result[0], result[2]
            
for file_name in orig.iterkeys():
    print file_name
    
    for def_scope, names in orig[file_name].iteritems():
        print '\t', names
        for strategy, dscope in data[file_name].iteritems():
            try:
                print '\t\t', strategy, dscope[def_scope]
            except:
                pass

    print


    
    
    
    

