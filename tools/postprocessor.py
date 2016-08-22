'''
Created on Aug 21, 2016

@author: caseycas
'''
import re

class Postprocessor:

    def __init__(self, mosesOutput):
        self.ignoreRegex = "^\|\d+-\d+\|$"
        self.extraUNK = "|UNK|UNK|UNK"
        self.processedOutput = self.processOutput(mosesOutput)
        
    def processOutput(self, rawOutput):
        i = 0
        tmp = ""
        for line in rawOutput.split("\n"):
            tmp += str(i) + " ||| " + self.processLine(line) + "\n"
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
        components = filter(lambda token : not re.match(self.ignoreRegex, token), rawLine.split())
        #Get rid of |UNK|UNK
        
        components = [token.replace(self.extraUNK, "") for token in components]
        return " ".join(components)
    
    def getProcessedOutput(self):
        return self.processedOutput
        
        
        