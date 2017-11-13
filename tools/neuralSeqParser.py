class NeuralSequenceParser:
    
    def __init__(self):
        self.name_candidates = {}
        self.lineLengthMap = {}

    def buildLineLengthMap(self, iB):
        """
        Helper: Fill in the field that tracks the length of each line in tokens via a map.
        Note that line number in the tokens map ignores blank lines.  The line number in the
        #character map does not.
        
        Also, Fill in the map that tracks the line number of the token indicies by
        keying them with the line number of the character based measure.
        The character based measure tracks the true line number, the token based one
        ignores blank lines.
        TODO: reconsider this as it is a copy of a method in VariableMetrics        

        Parameters
        ---------- 
        
        Returns
        -------
        """     
        orderedLines = sorted(iB.tokMap.items(), key = lambda (x,y) : (y[0],y[1]))
        for (tok_pos, char_pos) in orderedLines:
            char_line_num = char_pos[0]
            tok_line_num = tok_pos[0]
            
            #Fill in the line length map
            if(tok_line_num not in self.lineLengthMap):
                self.lineLengthMap[tok_line_num] = 0 #All lines will have the newline token, which we don't want to count, so start at 0
            else:
                self.lineLengthMap[tok_line_num] += 1


    def parse(self, 
              neural_output, 
              iBuilder,
              position_names):#,
#               scopeAnalyst=None):
       
        #print("Parsing - index Builder")
        #print(iBuilder)
        #print("------------------------")

        self.buildLineLengthMap(iBuilder)
        #Track the index of the neural list we are at.
        neural_idx = 0

        #Remove newlines from tokens.
        neural_output = [tok.strip() for tok in neural_output]

        for line_num, line_length in self.lineLengthMap.iteritems(): #Will this be numerically ordered.
            translation_parts = neural_output[neural_idx:neural_idx+line_length]
            neural_idx = neural_idx + line_length 
       
            #This was a sanity check for line invariance.  I think for this version
            #we need to check and overwrite for the whole file? Leave for future possible debugging. 
            if len(translation_parts) != len(iBuilder.tokens[line_num]):
                translation_parts = [token for (_token_type, token) \
                                        in iBuilder.tokens[line_num]]
                translation = ' '.join(translation_parts)
            
            #    # Which within-line indices have non-global var names? 
            #     print("------------------------")
            line_dict = position_names.get(line_num, {})
            #     print("line_dict:")
            #     print(line_dict) 
            #     print("line_translation:")
            #     print(translation_parts)
            #quit()
            #print(n)
            # For each variable name, record its candidate translation
            # and on how many lines (among the -n-best-list) it appears on
            for line_idx in line_dict.keys():
                
                # The original variable name
                # line_dict returns (name, def_scope)
                k = line_dict[line_idx] 
                #print(k)
#                 if scopeAnalyst is not None:
#                     (l,c) = iBuilder.tokMap[(n, line_idx)]
#                     p = iBuilder.flatMap[(l,c)]
#                     use_scope = scopeAnalyst.name2useScope[(name, p)]
#                 else:
#                     use_scope = None
                
                # The translated variable name
                name_translation = translation_parts[line_idx]
                if(name_translation == "SAME"):
                    name_translation = k[0]
                #print("Index: " + str(line_idx) + " Translation: " + name_translation) 
                # Record the line number (we may give more weight
                # to names that appear on many translation lines)
                self.name_candidates.setdefault(k, {})
                self.name_candidates[k].setdefault(name_translation, set([]))
                self.name_candidates[k][name_translation].add(line_num)
#                 self.name_candidates[k].setdefault(use_scope, {})
#                 self.name_candidates[k][use_scope].setdefault(name_translation, set([]))
#                 self.name_candidates[k][use_scope][name_translation].add(n)
            


        return self.name_candidates
