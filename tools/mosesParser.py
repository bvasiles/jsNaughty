'''
Created on Dec 22, 2016

@author: Bogdan Vasilescu
'''


class MosesParser:
    
    def __init__(self):
        self.name_candidates = {}
        
    
    def parse(self, 
              moses_output, 
              iBuilder,
              position_names,
              scopeAnalyst=None):
            
        for line in moses_output.split('\n'):
        
            translations = {}
            
            parts = line.split('|||')
            if not len(parts[0]):
                continue
    
            # The index of the line in the input to which this
            # translated line corresponds, starting at 0:
            n = int(parts[0])
    
            # The translation:
            translation = parts[1].strip()
            translation_parts = translation.split(' ')
    
            # Only keep translations that have exactly the same 
            # number of tokens as the input
            # If the translation has more tokens, copy the input
            if len(translation_parts) != len(iBuilder.tokens[n]):
                translation_parts = [token for (_token_type, token) \
                                        in iBuilder.tokens[n]]
                translation = ' '.join(translation_parts)
            
            # An input can have identical translations, but with
            # different scores (the number of different translations
            # per input is controlled by the -n-best-list decoder
            # parameter). Keep only unique translations.
            translations.setdefault(n, set([]))
            translations[n].add(translation)
           
            # Which within-line indices have non-global var names? 
            line_dict = position_names.get(n, {})
            
            # For each variable name, record its candidate translation
            # and on how many lines (among the -n-best-list) it appears on
            for line_idx in line_dict.keys():
                
                # The original variable name
                (name, def_scope) = line_dict[line_idx]
                
                if scopeAnalyst is not None:
                    (l,c) = iBuilder.tokMap[(n, line_idx)]
                    p = iBuilder.flatMap[(l,c)]
                    use_scope = scopeAnalyst.name2useScope[(name, p)]
                else:
                    use_scope = None
                
                # The translated variable name
                name_translation = translation_parts[line_idx]
    
                k = (name, def_scope)
                
                # Record the line number (we will give more weight
                # to names that appear on many translation lines) 
                self.name_candidates.setdefault(k, {})
                self.name_candidates[k].setdefault(use_scope, {})
                self.name_candidates[k][use_scope].setdefault(name_translation, set([]))
                self.name_candidates[k][use_scope][name_translation].add(n) 
                    
        return self.name_candidates
