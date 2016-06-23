from pygments.token import Token, String, is_token_subtype


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
        
        # - map from (token_line, token_column) position in the 
        # bidimensional list of tokens to (line,col) text position
        self.tokMap = {}
        
        # - map from (line,col) position to (token_line, token_column)
        # position in the bidimensional list of tokens
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
            p = (line_chr_idx,col_chr_idx)
            
            if is_token_subtype(token_type, Token.Name):
                
                # Map (line_chr_idx, col_chr_idx) location to name (1:1)
                self.charPosition2Name[p] = token
                
                # Map name to (line_chr_idx, col_chr_idx) locations (1:n)
                self.name2CharPositions.setdefault(token, []).append(p)
                
                # Map (line_chr_idx, col_chr_idx) index to unidimensional index 
                self.flatMap[p] = flat_chr_idx
            
            # Build bidimensional token list (lines, columns)
            if not is_token_subtype(token_type, String.Doc) and \
                    not is_token_subtype(token_type, Token.Comment):
                if not is_token_subtype(token_type, Token.Text):
                    line.append((token_type, token.strip()))
                    
                    # Map character indices to token indices
                    self.revTokMap[p] = (line_tok_idx,col_tok_idx)
                    self.tokMap[(line_tok_idx,col_tok_idx)] = p
                    
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
    
    