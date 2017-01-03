'''
Created on Aug 21, 2016

@author: caseycas
'''
import re

class Postprocessor:

    def __init__(self, nbestList):
        self.ignoreRegex = "^\|\d+-\d+\|$"
        self.extraUNK = "|UNK|UNK|UNK"
        
        # Extract and combine the n-best list into the expected format
        translations = []
        for entry in nbestList:
            tmp = self.processOutput(entry['hyp'])
            translations.append(tmp)

        # Weave the translations together. 
        # Assumption -> 10 translations each of equal length
        combined = []
        for i in range(0, len(translations[0])):
            combined += [t[i] for t in translations]

        self.processedOutput = "\n".join(combined)
        
        
    def processOutput(self, rawOutput):
        i = 0
        tmp = []
        for line in rawOutput.split("\n"):
            tmp.append(str(i) + " ||| " + self.processLine(line))
            i += 1
            
        return tmp
    
    
    def processLine(self, rawLine):
        '''
        Process lines like:
        var|UNK|UNK|UNK SECTION|UNK|UNK|UNK =|UNK|UNK|UNK TOKEN_LITERAL_STRING|UNK|UNK|UNK |0-3| ;
        into
        var SECTION = TOKEN_LITERAL_STRING
        '''
        #Remove line number tokens
        components = filter(lambda token: not re.match(self.ignoreRegex, token), 
                            rawLine.split())
        
        #Get rid of |UNK|UNK
        components = [token.replace(self.extraUNK, "") for token in components]

        return " ".join(components)
    
    
    def getProcessedOutput(self):
        return self.processedOutput
        
        
        
