from pygments.token import Token, is_token_subtype
import hashlib


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
    
    
def renameUsingHashAllPrec(scopeAnalyst, iBuilder_ugly):
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
                          
#                     if token == 'r' and line_idx == 13:
#                         print token, pos
#                         print line_context
#                         print where_before
#                         print left
#                         print context_tokens
#                         print
     
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
                sha_str = sha(concat_str, debug=True)
                
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



def renameUsingHashDefLine(scopeAnalyst, iBuilder_ugly):
    '''
    '''

    name2defScope = scopeAnalyst.resolve_scope()
    isGlobal = scopeAnalyst.isGlobal
    name2useScope = scopeAnalyst.resolve_use_scope()
    name2pth = scopeAnalyst.resolve_path()
    nameOrigin = scopeAnalyst.nameOrigin
    #origin = nameOrigin[(token, scope)] == pth = name2pth[(token, pos)]
                    
    hash_renaming = []
                 
#     for k in sorted(isGlobal.keys()):
#         print k
                 
    context = {}
    
    seen_def = {}
    seen = {}
         
    for line_idx, line in enumerate(iBuilder_ugly.tokens):
        
        for token_idx, (token_type, token) in enumerate(line):
            (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
            pos = iBuilder_ugly.flatMap[(l,c)]
                
            # isGlobal only exists for Token.Name tokens
#             if not isGlobal.get((token, pos), True):
            
            try:
                def_scope = name2defScope[(token, pos)]
                pth = name2pth[(token, pos)]
            except KeyError:
                continue
            
            # If token is defined on the current line,
            # count this line towards token's context.
            if pth == nameOrigin.get((token, def_scope), None) and \
                    not seen_def.get((token, def_scope), False):
                
                context_tokens = []
                
                for tidx, (tt, t) in enumerate(line):
                    (tl,tc) = iBuilder_ugly.tokMap[(line_idx, tidx)]
                    p = iBuilder_ugly.flatMap[(tl,tc)]
                    
#                     if t == 'sum':
#                         print t, p, isGlobal[(t,p)] #isGlobal.get((t, p), False)
                     
                    if isGlobal.get((t, p), True) or \
                            not is_token_subtype(tt, Token.Name):
                        context_tokens.append(t)
                     
                    if t == token and p == pos and not isGlobal.get((t, p), True):
                        context_tokens.append('#')
                        
# #                         if isValidContextToken((tt, t)):
#                     if (is_token_subtype(tt, Token.Name) and \
#                             isGlobal.get((t, p), True)) or \
#                             not is_token_subtype(tt, Token.Name):
#                         context_tokens.append(t)
#                          
#                     if (is_token_subtype(tt, Token.Name) and \
#                                 not isGlobal[(t, p)]) and \
#                                 t == token and p == pos:
#                         context_tokens.append('here')
#                         
#                         if t == token and p == pos and isGlobal.get((t, p), False):
#                             context_tokens.append('here')
            
            context.setdefault((token, def_scope), [])
            context[(token, def_scope)] += context_tokens
            
            seen_def[(token, def_scope)] = True

#     for line_idx, line in enumerate(iBuilder_ugly.tokens):
#            
#         for token_idx, (token_type, token) in enumerate(line):
#             (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
#             pos = iBuilder_ugly.flatMap[(l,c)]
#                   
#             # isGlobal only exists for Token.Name tokens
# #             if not isGlobal.get((token, pos), True):
#             
#             try:
#                 def_scope = name2defScope[(token, pos)]
#                 pth = name2pth[(token, pos)]
#                       
#                 # Otherwise if this is the first non-def line
#                 # for this token, count it towards its context.
#                 if pth != nameOrigin[(token, def_scope)] and \
#                         not seen.get((token, def_scope), False):
#                       
#                     context_tokens = []
#                     for tidx, (tt, t) in enumerate(line):
#                         (tl,tc) = iBuilder_ugly.tokMap[(line_idx, tidx)]
#                         p = iBuilder_ugly.flatMap[(tl,tc)]
#                           
#                         if isValidContextToken((tt, t)):
#                             if (is_token_subtype(tt, Token.Name) and \
#                                     isGlobal.get((t, p), True)) or \
#                                     (t == token and p == pos) or \
#                                     not is_token_subtype(tt, Token.Name):
#                                 context_tokens.append(t)
#                         
# #                         if t == token and p == pos and isGlobal.get((t, p), False):
# #                             context_tokens.append('here')
#                     
#                     context.setdefault((token, def_scope), [])
#                     context[(token, def_scope)] += context_tokens
#                       
#                     seen[(token, def_scope)] = True
# 
#             except KeyError:
#                 pass
                          
                       
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
                sha_str = sha(concat_str, debug=True)
                  
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


