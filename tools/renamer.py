'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''

# from pygments.token import Token, is_token_subtype
# import hashlib
from copy import deepcopy
from pygments.token import Token, String, Number, is_token_subtype
import hashlib
from helpers import prepHelpers
from consistency import ConsistencyResolver
from normalizer import Normalizer
from config import RenamingStrategies
from indexer import IndexBuilder
from lexer import WebLexer
from uglifyJS import Beautifier
from scoper import WebScopeAnalyst 
 

class PostRenamer:
    
    def __init__(self):
        self.RS = RenamingStrategies()
    
    def _isHash(self, name):
        # _45e4313f
        return len(name) == 9 and name[0] == '_' and name[1:].isalnum()
    
    def _isRef(self, name):
        # _ref15
        return len(name) >= 4 and name[0:4] == '_ref' and name[4:].isdigit()

    def _isScopeId(self, name):
        # a_16
        return len(name.split('_')) > 0 and name.split('_')[-1].isdigit()

    def get_text(self):
        tokens = []
        for _line_idx, line in enumerate(self.tokens):
            tokens.append(' '.join([t for (_tt,t) in line]))
        return '\n'.join(tokens)


    def applyRenaming(self,
                       iBuilder,
                       name_positions, 
                       renaming_map):
        
        draft_translation = deepcopy(iBuilder.tokens)
    
        for (name, def_scope), renaming in renaming_map.iteritems():
            for (line_num, line_idx) in name_positions[(name, def_scope)]:
                (token_type, _token) = draft_translation[line_num][line_idx]
                draft_translation[line_num][line_idx] = (token_type, renaming)
                
        tokens = []
        for _line_idx, line in enumerate(draft_translation):
            tokens.append(' '.join([t for (_tt,t) in line]))
    
        return '\n'.join(tokens)
    
    
    def __is_invalid(self,
                     renaming,
                     r_strategy):
        if r_strategy == self.RS.NONE:
            return False
            
        elif r_strategy == self.RS.NORMALIZED:
            return self._isRef(renaming)
        
        elif r_strategy == self.RS.SCOPE_ID:
            return self._isScopeId(renaming)
        
        elif r_strategy == self.RS.HASH_ONE or \
                r_strategy == self.RS.HASH_TWO:
            return self._isHash(renaming)
        
        else:
            return False

        
    
    def updateRenamingMap(self,
                          name_positions, 
                          position_names,
                          renaming_map,
                          r_strategy):
        new_renaming_map = {}
        
#         print 'name_positions---------------'
#         for k, v in name_positions.iteritems():
#             print k, v
#         print
        
        for (name, def_scope), renaming in renaming_map.iteritems():
#             print (name, def_scope)
#             print '   --', renaming, self.__is_invalid(renaming, r_strategy), use_scope
            
            if not self.__is_invalid(renaming, r_strategy):
                new_renaming_map[(name, def_scope)] = renaming
            else:
                (line_num, line_idx) = name_positions[(name, def_scope)][0]
                (old_name, _def_scope) = position_names[line_num][line_idx]
                
                new_renaming_map[(name, def_scope)] = old_name
        
#         print 'map updated---------------'
        return new_renaming_map
        





class PreRenamer:
    
    def __init__(self):
        self.RS = RenamingStrategies()

#         self.simple_direct_map = {}
#         self.simple_inverse_map = {}
    
    
    def __isValidContextToken(self, (token_type, token)):
        # Token.Name.* if not u'TOKEN_LITERAL_NUMBER' or u'TOKEN_LITERAL_STRING'
        # Token.Operator
        # Token.Punctuation
        # Token.Keyword.*
        return True
        if token != u'TOKEN_LITERAL_NUMBER' and \
                token != u'TOKEN_LITERAL_STRING':
    #                  and \
    #                     (is_token_subtype(token_type, Token.Name) or \
    #                     is_token_subtype(token_type, Token.Punctuation) or \
    #                     is_token_subtype(token_type, Token.Operator)):
            return True
        return False
    
    
    def __generateScopeIds(self, num_scopes, except_ids):
        ids = []
        idx = 0
        while len(ids) < num_scopes:
            if idx not in except_ids:
                ids.append(idx)
            idx += 1
        return ids
    
    
    def __sha(self, concat_str, debug=False):
        if not debug:
            return '_' + hashlib.sha1(concat_str).hexdigest()[:8]
        else:
            return '<<' + concat_str + '>>'
    
 
    def renameUsingScopeId(self, 
                           scopeAnalyst, 
                           iBuilder_ugly):
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
        scope2id = dict(zip(scopes, self.__generateScopeIds(len(scopes), except_ids)))
    
#         print scope2id
    
        renaming = []
            
        for line_idx, line in enumerate(iBuilder_ugly.tokens):
            
#             print line_idx, line
             
            new_line = []
            for token_idx, (token_type, token) in enumerate(line):
#                 print '  ', token_idx, (token_type, token)
                try:
                    (l,c) = iBuilder_ugly.tokMap[(line_idx,token_idx)]
                    pos = iBuilder_ugly.flatMap[(l,c)]
                    def_scope = name2defScope[(token, pos)]
                except KeyError:
#                     if is_token_subtype(token_type, String):
#                         new_line.append('TOKEN_LITERAL_STRING')
#                     elif is_token_subtype(token_type, Number):
#                         new_line.append('TOKEN_LITERAL_NUMBER')
#                     else:
                    new_line.append(token)
                    continue
     
                if is_token_subtype(token_type, Token.Name) and \
                        scopeAnalyst.is_overloaded(token) and \
                        not isGlobal[(token, pos)]:
                    # Must rename token to something else
                    # Append def_scope id to name
                    new_line.append('%s_%d' % (token, scope2id[def_scope]))
                else:
#                     if is_token_subtype(token_type, String):
#                         new_line.append('TOKEN_LITERAL_STRING')
#                     elif is_token_subtype(token_type, Number):
#                         new_line.append('TOKEN_LITERAL_NUMBER')
#                     else:
                    new_line.append(token)
             
            renaming.append(' '.join(new_line) + "\n")
        
#         print 'renamingUsingScopeId:', renaming
        return renaming
    
    
    
    def renameUsingHashAllPrec(self,
                               scopeAnalyst, 
                               iBuilder_ugly,
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
                        if self.__isValidContextToken((token_type, token)):
                            line_context.append((token, pos))
         
                except KeyError:
                    if self.__isValidContextToken((token_type, token)):
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
                    sha_str = self.__sha(concat_str, debug)
                    
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
    
    
    
    def renameUsingHashDefLine(self,
                               scopeAnalyst, 
                               iBuilder, 
                               twoLines=False, 
                               debug=False):
        '''
        '''
    
    #     hash_renaming = []
                     
        context = {}
        
        def traversal(scopeAnalyst, iBuilder, context, condition):
            
            seen = {}
#             print("name2defScope---------------------------------------------------")
#             print(scopeAnalyst.name2defScope)
            for line_idx, line in enumerate(iBuilder.tokens):
#                 print("Traversing: " + str(line_idx) + " ----- " + str(line))
                for token_idx, (token_type, token) in enumerate(line):
                    (l,c) = iBuilder.tokMap[(line_idx,token_idx)]
                    pos = iBuilder.flatMap[(l,c)]
                    
                    #if(True):
                    try:
                        if(is_token_subtype(token_type, Token.Name)):
#                             print("NAME!!!!!!" + str(token))
                            def_scope = scopeAnalyst.name2defScope[(token, pos)]
    #                       use_scope = scopeAnalyst.name2useScope[(token, pos)]
                            pth = scopeAnalyst.name2pth[(token, pos)]
                    except KeyError:
#                         print("KEY ERROR! " + str(token_idx) + " -- " + str(token_type) + " -- " + str(token))
                        continue
                    
                    if not self.__isValidContextToken((token_type, token)):
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
        
#         print("context-------------------------------------")
#         print(context)
        
        if twoLines:
            context = traversal(scopeAnalyst, iBuilder, context, passTwo)
            
#         print("context-------------------------------------")
#         print(context)
        
    #     (name_positions, _position_names) = prepareHelpers(iBuilder, scopeAnalyst)
        (name_positions, _position_names, use_scopes) = prepHelpers(iBuilder, scopeAnalyst)
        
        shas = {}
        name_candidates = {}
        
#         print("name_candidates-------------------------------------")
        for (token, def_scope), context_tokens in context.iteritems():
            concat_str = ''.join(context_tokens)
            renaming = shas.setdefault(concat_str, self.__sha(concat_str, debug))
            
            name_candidates.setdefault((token, def_scope), {})
            
            for (line_num, line_idx) in name_positions[(token, def_scope)]:
                (l,c) = iBuilder.tokMap[(line_num, line_idx)]
                p = iBuilder.flatMap[(l,c)]
                use_scope = scopeAnalyst.name2useScope[(token, p)]
            
                name_candidates[(token, def_scope)].setdefault(use_scope, {})
                name_candidates[(token, def_scope)][use_scope].setdefault(renaming, set([]))
                name_candidates[(token, def_scope)][use_scope][renaming].add(1)
    
#             print (token, def_scope)
    
        cs = ConsistencyResolver()
        renaming_map = cs.computeFreqLenRenaming(name_candidates,
                                              name_positions,
                                              use_scopes,
                                              lambda e:e)
        
#         for ((name, def_scope), _use_scope), renaming in renaming_map.iteritems():
#             self.simple_direct_map[(name, def_scope)] = (renaming, def_scope)
#             self.simple_inverse_map[(renaming, def_scope)] = (name, def_scope)
            
        
#         for (k, use_scope), renaming in renaming_map.iteritems():
#             print k
#             print renaming, use_scope
#           
#         print
    
        hash_renaming = self.apply_renaming(iBuilder, name_positions, renaming_map)
        
#         print hash_renaming
        return hash_renaming
        
#         print("lines-------------------------------------------------------")
#         print('\n'.join([' '.join([token for (_token_type, token) in line]) 
#                                 for line in hash_renaming]))
#         print("lines-------------------------------------------------------")

        
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
    #         return hash_renaming


    def collapse(self, renaming):
        return '\n'.join([' '.join([token for (_token_type, token) in line]) 
                                for line in renaming]) + '\n'
    
    
    
    def strip_literals(self, iBuilder):
        tokens = []
        for line in iBuilder.tokens:
            new_line = []
            for (token_type, token) in line:
                if is_token_subtype(token_type, String):
                    new_line.append('TOKEN_LITERAL_STRING')
                elif is_token_subtype(token_type, Number):
                    new_line.append('TOKEN_LITERAL_NUMBER')
                else:
                    new_line.append(token)
            tokens.append(new_line)
        return tokens
        
        
    def apply_renaming(self,
                       iBuilder,
                       name_positions, 
                       renaming_map):
    
        draft_translation = deepcopy(iBuilder.tokens)
#         draft_translation = self.strip_literals(iBuilder)
        
        for ((name, def_scope), _use_scope), renaming in renaming_map.iteritems():
            for (line_num, line_idx) in name_positions[(name, def_scope)]:
                (token_type, _name) = draft_translation[line_num][line_idx]
                draft_translation[line_num][line_idx] = (token_type, renaming)
     
        return draft_translation
    
    
    
                        
    
    
    def rename(self, 
               r_strategy,
               iBuilder, 
               scopeAnalyst, 
               debug=False):
        
        if r_strategy == self.RS.NONE:
            return iBuilder.get_text()
#             return iBuilder.get_text_wo_literals()
            
        elif r_strategy == self.RS.NORMALIZED:
            text = iBuilder.get_text()
#             text = iBuilder.get_text_wo_literals()
            
            norm = Normalizer()
            (ok, out, _err) = norm.web_run(text, rename=True)
            if not ok:
                return text
            
            # The normalization affects global variables too
            # Fall back on input in those cases
            clear = Beautifier()
            (ok, b_out, _err) = clear.web_run(out)
#             print b_out, _err
            if not ok:
                return text
            
            iB = IndexBuilder(WebLexer(b_out).tokenList)
            iB_copy = deepcopy(iB)

            sA = WebScopeAnalyst(b_out)
            isGlobal = sA.isGlobal
#             print 'isGlobal------'
#             for key,val in isGlobal.iteritems():
#                 print key,val
            
            for line_num, line in enumerate(iB.tokens):
                for line_idx, (token_type, token) in enumerate(line):
                    if is_token_subtype(token_type, Token.Name):
                        (l,c) = iB.tokMap[(line_num, line_idx)]
                        p = iB.flatMap[(l,c)]
#                         print token, isGlobal.get((token, p), True)

                        if isGlobal.get((token, p), True):
                            iB_copy.tokens[line_num][line_idx] = \
                                iBuilder.tokens[line_num][line_idx]
            
            return iB_copy.get_text()

        
        elif r_strategy == self.RS.SCOPE_ID:
            return ''.join(self.renameUsingScopeId(scopeAnalyst, 
                                                         iBuilder))
        
        elif r_strategy == self.RS.HASH_ONE:
            return self.collapse(self.renameUsingHashDefLine(scopeAnalyst, 
                                                             iBuilder,
                                                             twoLines=False,
                                                             debug=debug))
        
        elif r_strategy == self.RS.HASH_TWO:
            return self.collapse(self.renameUsingHashDefLine(scopeAnalyst, 
                                                             iBuilder, 
                                                             twoLines=True,
                                                             debug=debug))
        
        else:
            return iBuilder.get_text()
        
        
        