import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.path.pardir)))
from unicodeManager import UnicodeReader, UnicodeWriter
import multiprocessing
from tools import ScopeAnalyst, Lexer, IndexBuilder
                    

def processFile(l):
    
    js_file_name = l
    
    candidates = []
        
    try:
        lexer = Lexer(os.path.join(results_path, js_file_name))
        iBuilder = IndexBuilder(lexer.tokenList)
        
        scopeAnalyst = ScopeAnalyst(os.path.join(results_path, 
                                                 js_file_name))
        nameOrigin = scopeAnalyst.nameOrigin
        isGlobal = scopeAnalyst.isGlobal
        nameDefScope2pos = scopeAnalyst.nameDefScope2pos
        
        for (name, def_scope) in nameOrigin.iterkeys():
            pos = nameDefScope2pos[(name, def_scope)]
            
            (lin,col) = iBuilder.revFlatMat[pos]
            scope = iBuilder.revTokMap[(lin,col)]
            
            glb = isGlobal.get((name, pos), True)
            
#             if not isGlobal.get((name, pos), True):
#                 scope = def_scope.replace("\"","")
#                 i = scope.find('[variables][_values]')
#                 if i > -1:
#                     scope = scope[:i+len('[variables][_values]')]
#                 i = scope.find('[functions][_values]')
#                 if i > -1:
#                     scope = scope[:i+len('[functions][_values]')]
            
            if name != 'TOKEN_LITERAL_STRING' and \
                    name != 'TOKEN_LITERAL_NUMBER':
                candidates.append( (scope, name, glb) )

    except:
        return (js_file_name, None, 'ScopeAnalyst fail')
    
    return (js_file_name, 'OK', candidates)
        



csv_path = os.path.abspath(sys.argv[1])
results_path = os.path.abspath(sys.argv[2])
num_threads = int(sys.argv[3])

# num_trivial = 5
num_non_trivial = 8

data = {}
coverage = {}

strategies = set([])

reader = UnicodeReader(open(csv_path))

for row in reader:
    # 1436583.js;hash_def_one_renaming.freqlen;$[body][0][definitions][0][value][body][2][body][right][variables][_values][$n][scope];9;8;False;config;config
    file_name = row[0]
    
    strategy = row[1]
    strategies.add(strategy)
    
    tok_lin = int(row[3])
    tok_col = int(row[4])
    scope = (tok_lin,tok_col) #row[2]

#     glb = row[5]
#     i = scope.find('[variables][_values]')
#     if i > -1:
#         scope = scope[:i+len('[variables][_values]')]
#     i = scope.find('[functions][_values]')
#     if i > -1:
#         scope = scope[:i+len('[functions][_values]')]
        
    translated_name = row[6]
#     ugly_name = row[4] if len(row[4]) else None
    alternatives = row[7] if len(row[7]) else None
    
    if translated_name != 'TOKEN_LITERAL_STRING' and \
            translated_name != 'TOKEN_LITERAL_NUMBER':
    
        data.setdefault(file_name, {})
        data[file_name].setdefault(strategy, {})
        data[file_name][strategy][scope] = (translated_name, alternatives)
        
        coverage.setdefault(file_name, {})
        coverage[file_name].setdefault(scope, set([]))
        coverage[file_name][scope].add(strategy)
            
    #                                               ugly_name, 
    #     print file_name, strategy, scope, (translated_name, alternatives)
    #     data[file_name][strategy].setdefault(scope, [])
    #     data[file_name][strategy][scope].append( (translated_name, 
    #                                               ugly_name, 
    #                                               alternatives) )
    
    
print len(data.keys()), 'files'

# wo = [k for k,v in data.iteritems() if len(v.keys())==num_trivial]
# print len(wo), 'w/o Moses'

w = [k for k,v in data.iteritems() if len(v.keys())==num_non_trivial]
print len(w), 'w Moses'

print len(data.keys()) - len(w), 'unaccounted for'
print
 

s2n = {}
n2s = {}
for idx, strategy in enumerate(sorted(strategies)):
    s2n[strategy] = idx
    n2s[idx] = strategy
    print idx, strategy
print

orig = {}

pool = multiprocessing.Pool(processes=num_threads)
      
for result in pool.imap_unordered(processFile, w):
    if result[1] is not None:
        file_name, ok, candidates = result
        
        orig.setdefault(file_name, {})

        for (def_scope, name, glb) in candidates:
            orig[file_name][def_scope] = (name, glb)

#             print file_name, def_scope, (name, glb)
#             orig[file_name].setdefault(def_scope, [])
#             orig[file_name][def_scope].append(name)
    
    else:
        print result[0], result[2]


writer = UnicodeWriter(open(os.path.join(results_path, 
                                        'stats.csv'), 'w'))
writer.writerow(['file', 'num_names', 'num_glb_names', 'num_loc_names'] + 
                [n2s[i].replace('.','_') 
                 for i in range(len(strategies))] +
                [n2s[i].replace('.','_')+'_all' 
                for i in range(len(strategies))] +
                [n2s[i].replace('.','_')+'_glb' 
                for i in range(len(strategies))] +
                [n2s[i].replace('.','_')+'_maybe' 
                for i in range(len(strategies))])

for file_name in orig.iterkeys():
    row = [file_name]
    counts_loc = [0]*len(strategies)
    counts_glb = [0]*len(strategies)
    counts = [0]*len(strategies)
    alt_counts = [0]*len(strategies)
    
    num_names = 0
    num_glb_names = 0
    num_loc_names = 0
#     num_mini_names = 0
    
#     seen = {}
    
#     print file_name
    
    for def_scope, (name, glb) in orig[file_name].iteritems():
        
#         print file_name, def_scope, len(coverage[file_name][def_scope])
        
        if len(coverage[file_name][def_scope]) == num_non_trivial:

#             print '\t', name, def_scope, glb
            num_names += 1
            
            if glb:
                num_glb_names += 1
            else:
                num_loc_names += 1
            
            (translated_name, alternatives) =  \
                data[file_name]['no_renaming.lm'].values()[0]
                
    #         if translated_name != name:
    #             num_mini_names += 1
            
            num_strategies = 0
            
            for strategy, dscope in data[file_name].iteritems():
                
                num_strategies += 1
                
    #             if not seen.has_key(strategy):
    #                 counts[s2n[strategy]] = 0
    #                 seen[strategy] = True
                
                if dscope.has_key(def_scope):
    #                 print '\t\t', strategy, dscope[def_scope]
                    (translated_name, 
    #                  ugly_name, 
                     alternatives) = dscope[def_scope]
                    
                    if name == translated_name:
                    
                        if not glb:
                            counts_loc[s2n[strategy]] += 1
                        else:
                            counts_glb[s2n[strategy]] += 1
                            
                        counts[s2n[strategy]] += 1
                    
                    try:
                        if not glb:
                            if name in alternatives.split(','):
                                alt_counts[s2n[strategy]] += 1
                    except:
                        pass
    
            try:
                assert num_strategies == num_non_trivial
            except AssertionError:
                print file_name, name, def_scope

#     print
    row += [num_names, num_glb_names, num_loc_names]#, num_mini_names]
    row += counts_loc
    row += counts
    row += counts_glb
    row += alt_counts
    writer.writerow(row)


    
    
    

