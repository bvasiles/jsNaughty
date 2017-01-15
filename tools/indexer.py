from pygments.token import Token, String, Number, is_token_subtype


class IndexBuilder:

    def __init__(self, lexed_input):
        # Build some helper data structures:
        
        # - bidimensional list of tokens
        self.tokens = []
        
        # - map from (line,col) position to name
        self.charPosition2Name = {}
        
        # - map from name to list of (line,col) positions
        self.name2CharPositions = {}
        
        # - map from (line,col) position to flat position
        self.flatMap = {}
        
        # - map from flat position to (line,col)
        self.revFlatMat = {}
        
        # - map from (token_line, token_column) position in the 
        # bidimensional list of tokens to (line,col) text position
        self.tokMap = {}
        
        # - map from (line,col) position to (token_line, token_column)
        # position in the bidimensional list of tokens
        # Also maps the prior whitespace character location to the token
        # that follows it.  That is, this is not in a one-to-one mapping
        # with tokMap.
        self.revTokMap = {}

        line = []
        
        line_chr_idx = 0
        col_chr_idx = 0
        flat_chr_idx = 0
        
        line_tok_idx = 0
        col_tok_idx = 0
        
        # Iterate over tokens; collect names and 
        # their (line_chr_idx, col_chr_idx) locations.
        # Populate the helper data structures.
        for (token_type, token) in lexed_input:
    #         print token_type, len(token), '"%s"' % token
            p = (line_chr_idx, col_chr_idx)
            
            # Map (line_chr_idx, col_chr_idx) index to unidimensional index 
            self.flatMap[p] = flat_chr_idx
            
            self.revFlatMat[flat_chr_idx] = p
        
            if is_token_subtype(token_type, Token.Name):
                
                # Map (line_chr_idx, col_chr_idx) location to name (1:1)
                self.charPosition2Name[p] = token
                
                # Map name to (line_chr_idx, col_chr_idx) locations (1:n)
                self.name2CharPositions.setdefault(token, []).append(p)
                
            # Map character indices to token indices
            #print("\'" + token + "\' " + str(p) + " " + str((line_tok_idx, col_tok_idx)))
            self.revTokMap[p] = (line_tok_idx, col_tok_idx)
            self.tokMap[(line_tok_idx, col_tok_idx)] = p
            
            # Build bidimensional token list (lines, columns)
            if not is_token_subtype(token_type, String.Doc) and \
                    not is_token_subtype(token_type, Token.Comment):
                if not is_token_subtype(token_type, Token.Text):
                    line.append((token_type, token.strip()))
                    
                    col_tok_idx += 1 
                
                elif '\n' in token:
                    self.tokens.append(line)
                    line = []
                    line_tok_idx += 1
                    col_tok_idx = 0
            
            # Increment line_chr_idx on newlines; reset col_chr_idx
            if token_type == Token.Text and '\n' in token:
                #'_ _ _ \n _ _ _ _ _ _ \n _ _ _ _'
                w = token.split('\n')
                line_chr_idx += len(w) - 1
                col_chr_idx = len(w[-1])
            # Otherwise just increment col_chr_idx
            else:
                col_chr_idx += len(token)
            # The unidimensional index doesn't care about newlines
            flat_chr_idx += len(token)

            
    def get_text(self):
        tokens = []
        for _line_idx, line in enumerate(self.tokens):
            tokens.append(' '.join([t for (_tt,t) in line ]))
        return '\n'.join(tokens)


    def get_text_wo_literals(self):
        tokens = []
            
        for _line_idx, line in enumerate(self.tokens):
            x = []
            for (tt,t) in line:
                if is_token_subtype(tt, String):
                    x.append('TOKEN_LITERAL_STRING')
                elif is_token_subtype(tt, Number):
                    x.append('TOKEN_LITERAL_NUMBER')
                else:
                    x.append(t)

            tokens.append(' '.join(x))
            
        return '\n'.join(tokens)
            

    def __repr__(self):
        return "IndexBuilder()"
    
    def __str__(self):
        '''
        # - map from (line,col) position to name
        self.charPosition2Name = {}
        # - map from name to list of (line,col) positions
        self.name2CharPositions = {}
        # - map from (line,col) position to flat position
        self.flatMap = {}
        # - map from flat position to (line,col)
        self.revFlatMat = {}
        # - map from (token_line, token_column) position in the 
        # bidimensional list of tokens to (line,col) text position
        self.tokMap = {}
        # - map from (line,col) position to (token_line, token_column)
        # position in the bidimensional list of tokens
        self.revTokMap = {}
        '''
        output = []
        output.append("--------------------charPosition2Name--------------------")
        output.append(self.charPosition2Name.__str__())
        output.append("--------------------name2CharPositions--------------------")
        output.append(self.name2CharPositions.__str__())
        output.append("--------------------flatMap--------------------")
        output.append(self.flatMap.__str__())
        output.append("--------------------revFlatMat--------------------")
        output.append(self.revFlatMat.__str__())
        output.append("--------------------tokMap--------------------")
        output.append(sorted(self.tokMap.items(), key = lambda (x,y) : (y[0],y[1])).__str__())
        output.append("--------------------revTokMap--------------------")
        output.append(sorted(self.revTokMap.items(), key = lambda (x,y) : (y[0],y[1])).__str__())
        return "\n".join(output)
        
    
    