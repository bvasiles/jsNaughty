from pygments.token import Token, is_token_subtype
import hashlib
from copy import deepcopy



def rename(iBuilder, 
           name_positions, 
           renaming_map):
    
    draft_translation = deepcopy(iBuilder.tokens)
    
    for (name, def_scope), renaming in renaming_map.iteritems():
        for (line_num, line_idx) in name_positions.get((name, def_scope),[]):
            (token_type, _name) = draft_translation[line_num][line_idx]
            draft_translation[line_num][line_idx] = (token_type, renaming)

    return draft_translation




def prepareHelpers(iBuilder, 
                   scopeAnalyst):

    # Collect names and their locations in various formats
    # that will come in handy later:
    
    # Which locations [(line number, index within line)] does
    # a variable name appear at?
    name_positions = {}
    
    # Which variable name is at a location specified by 
    # [line number][index within line]?
    position_names = {}
    
    for line_num, line in enumerate(iBuilder.tokens):
        position_names.setdefault(line_num, {})
        
        for line_idx, (token_type, token) in enumerate(line):
            
            if is_token_subtype(token_type, Token.Name):
                (l,c) = iBuilder.tokMap[(line_num, line_idx)]
                p = iBuilder.flatMap[(l,c)]
                
                name2defScope = scopeAnalyst.resolve_scope()
                isGlobal = scopeAnalyst.isGlobal
        
#                 try:
                if not isGlobal.get((token, p), True):
                    def_scope = name2defScope[(token, p)]
                    
                    name_positions.setdefault((token, def_scope), [])
                    name_positions[(token, def_scope)].append((line_num, line_idx))
                    position_names[line_num][line_idx] = (token, def_scope)
#                 except KeyError:
#                     pass

#                         cond = True
# #                         print (token, def_scope), line_num, line_idx
                
#                     cond = True
#                 if cond:
#                     print (token, def_scope), line_num, line_idx
                

    return (name_positions, position_names)
           



def computeFreqLenRenaming(name_candidates, 
                           name_positions,
                           sorting_key):
    
    renaming_map = {}
    seen = {}
    
    # There is no uncertainty about the translation for
    # variables that have a single candidate translation

    for key, val in name_candidates.iteritems():
        for use_scope, suggestions in val.iteritems():
            print key
            print '  ', use_scope
            print '  ', suggestions.keys()
            
            if len(suggestions.keys()) == 1:
                
                candidate_name = suggestions.keys()[0]
                
                (name, def_scope) = key
                
                # Don't use the same translation for different
                # variables within the same scope.
                if not seen.has_key((candidate_name, use_scope)):
#                     print (key, use_scope), candidate_name
                    renaming_map[(key, use_scope)] = candidate_name
                    seen[(candidate_name, use_scope)] = True
                else:
#                     print (key, use_scope), name
                    renaming_map[(key, use_scope)] = name
                    seen[(name, use_scope)] = True
                    # You can still get screwed here if name
                    # was the suggestion for something else 
                    # in this scope earlier. Ignoring for now
    
    print
    print
    
    # For the remaining variables, choose the translation 
    # that has the longest name
        
    token_lines = []
    
    for key, pos in name_positions.iteritems():
        token_lines.append((key, \
                            len(set([line_num \
                                 for (line_num, _line_idx) in pos]))))
        
    # Sort names by how many lines they appear 
    # on in the input, descending
    token_lines = sorted(token_lines, key=lambda e: -e[1])
#     print token_lines
    
    for key, _num_lines in token_lines:
        
        for use_scope, suggestions in name_candidates[key].iteritems():
#             suggestions[name_translation] = set([line numbers])
        
            # Sort candidates by how many lines in the translation
            # they appear on, and by name length, both descending
            candidates = sorted([(name_translation, len(line_nums)) \
                                 for (name_translation, line_nums) \
                                 in suggestions.items()], 
                                key=sorting_key) #lambda e:(-e[1],-len(e[0])))
        
            print key
            print '  ', candidates
            
            if len(candidates) > 1:

                (name, def_scope) = key
                unseen_candidates = [candidate_name 
                                     for (candidate_name, _occurs) in candidates
                                     if not seen.has_key((candidate_name, use_scope))]
                
                if len(unseen_candidates):
                    candidate_name = unseen_candidates[0]
                    
                    renaming_map[(key, use_scope)] = candidate_name
                    seen[(candidate_name, use_scope)] = True
                    
                else:
#                     print (key, use_scope), name
                    renaming_map[(key, use_scope)] = name
                    seen[(name, use_scope)] = True
            
    print
    print
            
            
    return renaming_map



def generateScopeIds(num_scopes, except_ids):
    ids = []
    idx = 0
    while len(ids) < num_scopes:
        if idx not in except_ids:
            ids.append(idx)
        idx += 1
    return ids


def renameUsingScopeId(scopeAnalyst, iBuilder_ugly):
    '''
    Simple renaming: disambiguate overloaded names 
    with indices: n -> n_1, n_2, n_3.
    The index is the def_scope id.
    '''
    
    name2defScope = scopeAnalyst.resolve_scope()
    isGlobal = scopeAnalyst.isGlobal

    # Figure out which _scope_idx suffixes are illegal
    except_ids = map(int, [name.split('_')[-1] 
                    for name in scopeAnalyst.nameScopes.keys()
                    if name.split('_')[-1].isdigit()])
        
    # Compute shorter def_scope identifiers
    scopes = set(name2defScope.values())
    scope2id = dict(zip(scopes, generateScopeIds(len(scopes), except_ids)))

    renaming = []
        
    for line_idx, line in enumerate(iBuilder_ugly.tokens):
         
        new_line = []
        for token_idx, (token_type, token) in enumerate(line):
            try:
                (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
                pos = iBuilder_ugly.flatMap[(l,c)]
                def_scope = name2defScope[(token, pos)]
            except KeyError:
                new_line.append(token)
                continue
 
            if is_token_subtype(token_type, Token.Name) and \
                    scopeAnalyst.is_overloaded(token) and \
                    not isGlobal[(token, pos)]:
                # Must rename token to something else
                # Append def_scope id to name
                new_line.append('%s_%d' % (token, scope2id[def_scope]))
            else:
                new_line.append(token)
         
        renaming.append(' '.join(new_line) + "\n")
    
    return renaming


def isValidContextToken((token_type, token)):
    # Token.Name.* if not u'TOKEN_LITERAL_NUMBER' or u'TOKEN_LITERAL_STRING'
    # Token.Operator
    # Token.Punctuation
    # Token.Keyword.*
    if token != u'TOKEN_LITERAL_NUMBER' and \
            token != u'TOKEN_LITERAL_STRING':
#                  and \
#                     (is_token_subtype(token_type, Token.Name) or \
#                     is_token_subtype(token_type, Token.Punctuation) or \
#                     is_token_subtype(token_type, Token.Operator)):
        return True
    return False
 


# def isValidContextToken2((token_type, token)):
#     # Token.Name.* if not u'TOKEN_LITERAL_NUMBER' or u'TOKEN_LITERAL_STRING'
#     # Token.Operator
#     # Token.Punctuation
#     # Token.Keyword.*
#     if token != u'TOKEN_LITERAL_NUMBER' and \
#             token != u'TOKEN_LITERAL_STRING' and \
#            (is_token_subtype(token_type, Token.Name) or \
#            is_token_subtype(token_type, Token.Punctuation) or \
#            is_token_subtype(token_type, Token.Operator)):
#         return True
#     return False

 
def sha(concat_str, debug=False):
    if not debug:
        return '_' + hashlib.sha1(concat_str).hexdigest()[:8]
    else:
        return '<<' + concat_str + '>>'
    
    
def renameUsingHashAllPrec(scopeAnalyst, iBuilder_ugly,
                           debug=False):
    '''
    More complicated renaming: collect the context around  
    each name (global variables, API calls, punctuation)
    and build a hash of the concatenation.
    '''

    name2defScope = scopeAnalyst.resolve_scope()
    isGlobal = scopeAnalyst.isGlobal
    name2useScope = scopeAnalyst.resolve_use_scope()
                    
    hash_renaming = []
                 
    context = {}
         
    for line_idx, line in enumerate(iBuilder_ugly.tokens):
         
        line_context = []
         
        for token_idx, (token_type, token) in enumerate(line):
            (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
            pos = iBuilder_ugly.flatMap[(l,c)]
                
            try:
                # isGlobal only exists for Token.Name tokens
                if not isGlobal[(token, pos)]:
                      
                    def_scope = name2defScope[(token, pos)]
                      
                    where_before = [tix \
                                    for tix, (tt, t) in enumerate(line) \
                                    if t == token and \
                                    tt == token_type and \
                                    tix < token_idx and \
                                    name2defScope[(t, iBuilder_ugly.flatMap[
                                        iBuilder_ugly.tokMap[(line_idx,tix)]])] 
                                        == def_scope]
     
                    left_token_idx = max(where_before) \
                                        if len(where_before) else 0
                    left = iBuilder_ugly.flatMap[iBuilder_ugly.tokMap[(line_idx, left_token_idx)]]
                                        
                    context_tokens = [t \
                                    for (t, p) in line_context \
                                    if p >= left and \
                                    p < pos]
                          
                    context.setdefault((token, def_scope), [])
                    context[(token, def_scope)] += context_tokens
                          
                else:
                    if isValidContextToken((token_type, token)):
                        line_context.append((token, pos))
     
            except KeyError:
                if isValidContextToken((token_type, token)):
                    line_context.append((token, pos))
                     
    shas = {}
    reverse_shas = {}
      
    for line_idx, line in enumerate(iBuilder_ugly.tokens):
          
        new_line = []
        for token_idx, (token_type, token) in enumerate(line):

            (l,c) = iBuilder_ugly.tokMap[(line_idx, token_idx)]
            pos = iBuilder_ugly.flatMap[(l,c)]
              
            try:
                # name2scope only exists for Token.Name tokens
                def_scope = name2defScope[(token, pos)]
                use_scope = name2useScope[(token, pos)]
                
                # context only exists for non-global names
                concat_str = ''.join(context[(token, def_scope)])
                  
                # Compute SHA1 hash of the context tokens
                sha_str = sha(concat_str, debug)
                
                # Replace name by SHA1 hash
                new_token = shas.setdefault(concat_str, sha_str)
                  
                # Compute reverse mapping
                reverse_shas.setdefault((sha_str, use_scope), set([]))
                reverse_shas[(sha_str, use_scope)].add(token)
                  
                # Detect collisions
                if len(reverse_shas[(sha_str, use_scope)]) > 1:
                    # Two different names from the same use_scope
                    # have the same hash. Rename one by prepending
                    # the variable/function name to the hash
                    sha_str = token + sha_str
                    new_token = sha_str
                  
                new_line.append(new_token)
                  
            except KeyError:
                # Everything except non-global names stays the same
                new_line.append(token)
         
        hash_renaming.append(' '.join(new_line) + "\n")

    return hash_renaming

                

def renameUsingHashDefLine(scopeAnalyst, 
                           iBuilder, 
                           twoLines=False, 
                           debug=False):
    '''
    '''

    hash_renaming = []
                 
    context = {}
    
    def traversal(scopeAnalyst, iBuilder, context, condition):
        
        seen = {}
        
        for line_idx, line in enumerate(iBuilder.tokens):
            
            for token_idx, (token_type, token) in enumerate(line):
                (l,c) = iBuilder.tokMap[(line_idx,token_idx)]
                pos = iBuilder.flatMap[(l,c)]
                
                try:
                    def_scope = scopeAnalyst.name2defScope[(token, pos)]
#                     use_scope = scopeAnalyst.name2useScope[(token, pos)]
                    pth = scopeAnalyst.name2pth[(token, pos)]
                except KeyError:
                    continue
                
                if not isValidContextToken((token_type, token)):
                    continue
                
                if scopeAnalyst.isGlobal.get((token, pos), True):
                    continue
                
                context_tokens = []
                
                # If token is defined on the current line,
                # count this line towards token's context.
                if condition(pth, scopeAnalyst, token, def_scope, seen):
                    
                    for tidx, (tt, t) in enumerate(line):
                        (tl,tc) = iBuilder.tokMap[(line_idx, tidx)]
                        p = iBuilder.flatMap[(tl,tc)]
                        
                        if scopeAnalyst.isGlobal.get((t, p), True) or \
                                not is_token_subtype(tt, Token.Name):
                            context_tokens.append(t)
                         
                        if t == token and p == pos and \
                                not scopeAnalyst.isGlobal.get((t, p), True):
                            context_tokens.append('#')
                            
                    seen[(token, def_scope)] = True
                    
                context.setdefault((token, def_scope), [])
                context[(token, def_scope)] += context_tokens
                
        return context
    
    
    def passOne(pth, scopeAnalyst, token, def_scope, seen):
        if pth == scopeAnalyst.nameOrigin.get((token, def_scope), None) and \
                not seen.get((token, def_scope), False):
            return True
        return False
    
    
    def passTwo(pth, scopeAnalyst, token, def_scope, seen):
        if pth != scopeAnalyst.nameOrigin[(token, def_scope)] and \
                not seen.get((token, def_scope), False):
            return True
        return False


    context = traversal(scopeAnalyst, iBuilder, context, passOne)
    
    if twoLines:
        context = traversal(scopeAnalyst, iBuilder, context, passTwo)
    
    (name_positions, _position_names) = prepareHelpers(iBuilder, scopeAnalyst)
    
    shas = {}
    name_candidates = {}
    
    for (token, def_scope), context_tokens in context.iteritems():
        concat_str = ''.join(context_tokens)
        renaming = shas.setdefault(concat_str, sha(concat_str, debug))
        
        name_candidates.setdefault((token, def_scope), {})
        
        for (line_num, line_idx) in name_positions[(token, def_scope)]:
            (l,c) = iBuilder.tokMap[(line_num, line_idx)]
            p = iBuilder.flatMap[(l,c)]
            use_scope = scopeAnalyst.name2useScope[(token, p)]
        
            name_candidates[(token, def_scope)].setdefault(use_scope, {})
            name_candidates[(token, def_scope)][use_scope].setdefault(renaming, set([]))
            name_candidates[(token, def_scope)][use_scope][renaming].add(1)



    renaming_map = computeFreqLenRenaming(name_candidates,
                                          name_positions,
                                          lambda e:e)
    
    for (k, use_scope), renaming in renaming_map.iteritems():
        print k
        print renaming, use_scope
    
    print 

    return rename(iBuilder, name_positions, renaming_map)

    
#     reverse_shas = {}
#         
#     for line_idx, line in enumerate(iBuilder.tokens):
#             
#         new_line = []
#         for token_idx, (_token_type, token) in enumerate(line):
#   
#             (l,c) = iBuilder.tokMap[(line_idx, token_idx)]
#             pos = iBuilder.flatMap[(l,c)]
#                 
#             try:
#                 # name2scope only exists for Token.Name tokens
#                 def_scope = scopeAnalyst.name2defScope[(token, pos)]
#                 use_scope = scopeAnalyst.name2useScope[(token, pos)]
#                   
#                 # context only exists for non-global names
#                 concat_str = ''.join(context[(token, def_scope)])
#                     
#                 # Compute SHA1 hash of the context tokens
#                 sha_str = sha(concat_str, debug)
#                   
#                 # Replace name by SHA1 hash
#                 new_token = shas.setdefault(concat_str, sha_str)
#                     
#                 # Compute reverse mapping
#                 reverse_shas.setdefault((sha_str, use_scope), set([]))
#                 reverse_shas[(sha_str, use_scope)].add(token)
#                     
#                 # Detect collisions
#                 if len(reverse_shas[(sha_str, use_scope)]) > 1:
#                     # Two different names from the same use_scope
#                     # have the same hash. Rename one by prepending
#                     # the variable/function name to the hash
#                     sha_str = token + '_' + sha_str
#                     new_token = sha_str
#                     
#                 new_line.append(new_token)
#                     
#             except KeyError:
#                 # Everything except non-global names stays the same
#                 new_line.append(token)
#            
#         hash_renaming.append(' '.join(new_line) + "\n")
# 
#     return hash_renaming


