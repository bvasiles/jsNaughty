'''
Created on Feb 12, 2017

@author: Casey Casalnuovo
'''

from pygments.token import Token
from pygments.token import is_token_subtype 

class VariableMetrics:

    def __init__(self, scopeAnalyst, indexBuilder, tokenList):
        self.sA = scopeAnalyst
        self.iB = indexBuilder
        self.tokens = tokenList
        
        #Caching maps
        self.posToLineMap = {} #Map linking a items location in the token line to its line number.
        self.externalVarLines = set() #Set of lines containing global variables
        self.literalsOnLines = set() #Set of lines containing a literal
        self.forOnLines = set() #Set of lines containing a for statement
        self.whileOnLines = set() #Set of lines containing a while statement
        self.lineLengthMap = {} #Map of the line_num -> line length in tokens.
        #Token lines in the index builder do not record blank lines as a line.  
        #Therefore, we need to map from the character lines to the token ones.
        self.charToTokLineMap = {}  
        
        self.processTokenList()
        self.buildLineLengthMap()
        
        #Map from keys of type (name, def_scope) (desired for output) -> [(name, flat_position)] (used by iB and sA)
        self.keyMap = {}
        #Reverse of above, each list entry has one item.
        self.revKeyMap = {}
        
        #Map for variables -> list of lines on which it appears
        #(name, def_scope) -> list of int
        self.lineList = {}

        #Map for variables (name, def_scope) -> number of lines on which it appears with an external variable (not including def line)
        self.externalLines = {}
        #Map for variables (name, def_scope) -> does an external variable appear on its def line. (bool)
        self.externalOnDef = {}
        #Map for # of lines it appears on with a for or while statement
        #(name, def_scope) -> (for_count, while_count)
        self.loopLines = {}
        #(name, def_scope) -> is there a literal in the defining line?
        self.literalOnDef = {}
        #(name, def_scope) -> # of lines it appears where there is also a literal (not including def)
        self.literalLines = {}
        #(name, def_scope) -> length in tokens of the longest line the variable appears on
        self.maxLengthLine = {}
        #(name, def_scope) -> average length in tokens of the lines the variable appears on
        self.aveLineLength = {}
        
        #Fill in all the maps
        self.getFileMetrics()

    def isLiteralOnLine(self, line):
        return line in self.literalsOnLines
    
    def isWhileOnLine(self, line):
        return line in self.whileOnLines
    
    def isForOnLine(self, line):
        return line in self.forOnLines        
    
    def processTokenList(self):
        """
        Helper: Walk through the token list and record the lines where 
        literals, for loops, and while loops occur
        
        Parameters
        ----------

        Returns
        -------

        """
        
        line_num = 0
        for token_type, token in self.tokens:
            if token_type == Token.Text and '\n' in token:
                line_num += 1
            else:
                #Check if literal
                if(is_token_subtype(token_type, Token.Literal)):
                    self.literalsOnLines.add(line_num)
                    
                #Check if for loop
                if(token_type == Token.Keyword and token.strip() == u'for'):
                    self.forOnLines.add(line_num)
                
                #Check if while loop
                if(token_type == Token.Keyword and token.strip() == u'while'):
                    self.whileOnLines.add(line_num)
    
    

                    
    def buildLineLengthMap(self):
        """
        Helper: Fill in the field that tracks the length of each line in tokens via a map.
        Note that line number in the tokens map ignores blank lines.  The line number in the
        #character map does not.
        
        Also, Fill in the map that tracks the line number of the token indicies by
        keying them with the line number of the character based measure.
        The character based measure tracks the true line number, the token based one
        ignores blank lines.
        
        Parameters
        ---------- 
        
        Returns
        -------
        """     
        orderedLines = sorted(self.iB.tokMap.items(), key = lambda (x,y) : (y[0],y[1]))
        for (tok_pos, char_pos) in orderedLines:
            char_line_num = char_pos[0]
            tok_line_num = tok_pos[0]
            self.charToTokLineMap[char_line_num] = tok_line_num #Written several times, but all the same, so it doesn't matter.
            #Fill in the line length map
            if(tok_line_num not in self.lineLengthMap):
                self.lineLengthMap[tok_line_num] = 0 #All lines will have the newline token, which we don't want to count, so start at 0
            else:
                self.lineLengthMap[tok_line_num] += 1
        
    
    
    def posToTokLine(self, position):
        """
        Helper: Given a token position in the tokenlist, return what line of the file it is on.
        This returns the token line variable -> this ignores blank lines, unlike the character line number.
        
        Parameters
        ----------
        name: integer of the token index
        
        Returns
        -------
        line: line number of the file it is on
        """
        
        #If the posToLineMap is not built, built it
        if(len(self.posToLineMap) == 0):
            #Get the line, character position of the token.
            for name, pos in self.sA.name2useScope.keys():
                #revTokMap is what allows us to convert from the character line to the token line.
                self.posToLineMap[pos] = self.iB.revTokMap[self.iB.revFlatMat[pos]][0]
                
        
        return self.posToLineMap[position]
    
    def posToLine(self, position):
        """
        Helper: Given a token position in the tokenlist, return what line of the file it is on.
        
        Parameters
        ----------
        name: integer of the token index
        
        Returns
        -------
        line: line number of the file it is on
        """
        
        #If the posToLineMap is not built, built it
        if(len(self.posToLineMap) == 0):
            #Get the line, character position of the token.
            for name, pos in self.sA.name2useScope.keys():
                #revTokMap is what allows us to convert from the character line to the token line.
                self.posToLineMap[pos] = self.iB.revFlatMat[pos][0]
        
        return self.posToLineMap[position]
    
    
    def isExternalOnLine(self, line):
        """
        Helper: Is there an external variable on this line. An external variable is one defined outside this snippet
        This means it cannot be minified.
        
        Parameters
        ----------
        line: integer of the line number
        
        Returns
        -------
        true if there is a external variable used on this line and false otherwise
        """
        if(len(self.externalVarLines) == 0):
            #Fill in the map
            
            #for name_pos, globalBool in self.sA.isGlobal.iteritems():
            #    if(globalBool):
            #        l = self.posToLine(name_pos[1])
            #        self.externalVarLines.add(l)     
            for lineCharPos, name in self.iB.charPosition2Name.iteritems():
                flatPos =  self.iB.flatMap[lineCharPos]
                if((name, flatPos) in self.sA.isGlobal):
                    if(self.sA.isGlobal[(name,flatPos)]):
                        self.externalVarLines.add(lineCharPos[0])
                else:
                    self.externalVarLines.add(lineCharPos[0])
        
        
        return line in self.externalVarLines


    def isDefinitionLine(self, variable, line):
        """
        Helper: Is this variable defined on this line?
        
        Parameters
        ----------
        variable: (name, def_scope) - unique identifer for this variable in this file
        line: a number where the line is
        
        Returns
        -------
        true if this variable is defined on this line, false otherwise
        """
        #print("Definition Line: ")
        #print(self.iB.revFlatMat[self.sA.nameDefScope2pos[variable]][0])
        return self.iB.revFlatMat[self.sA.nameDefScope2pos[variable]][0] == line
    
    def lineMetrics(self, uniqueLines):
        """
        Helper: find the maximum line length and the average line length from a set of lines.
        
        Parameters
        ----------
        uniqueLines: a set of valid line numbers for this file. This is the character based
        version of the line number -> i.e. it includes blank lines.  It is converted to 
        the token based version to not cause a key error in lineLengthMap
        
        Returns
        -------
        (maxLineLength -> longest line in the set (in tokens),
        aveLineLength -> average length of the lines in the set (in tokens))
        """
        lengths = []
        for line in uniqueLines:
            tok_line = self.charToTokLineMap[line]
            lengths.append(self.lineLengthMap[tok_line])
            
        #print(lengths)
            
        return (max(lengths), sum(lengths)/(float)(len(lengths)))
    
    def getFileMetrics(self):
        """
        Helper: Fills in the various maps containing interesting file metrics.
        
        Returns
        -------
        """
        
        #Build a map for each variable to the lines on which it appears
        #Also build keyMaps
        for name_pos, use_scope in self.sA.name2useScope.iteritems():
            name = name_pos[0]
            line = self.posToLine(name_pos[1])
            def_scope = self.sA.name2defScope[name_pos]
            
            #Fill in the key maps
            self.revKeyMap[name_pos] = (name, def_scope)
            if((name, def_scope) not in self.keyMap):
                self.keyMap[(name, def_scope)] = [name_pos]
            else:
                self.keyMap[(name, def_scope)].append(name_pos)
            
            #Fill in line maps.
            if((name, def_scope) not in self.lineList):
                self.lineList[(name, def_scope)] = [line]
            else:
                self.lineList[(name, def_scope)].append(line)  #Remember, line can appear multiple times.
                
        #Fill in the line metrics for each variable  
        
        for variable, lines in self.lineList.iteritems():
            #Fill in the data with false and 0s and then update information if we see it in lines.
            #print(variable)
            if(variable not in self.externalOnDef):
                self.externalOnDef[variable] = False
            
            if(variable not in self.literalOnDef):
                self.literalOnDef[variable] = False
                
            if(variable not in self.externalLines):
                self.externalLines[variable] = []
            
            if(variable not in self.literalLines):
                self.literalLines[variable] = []            
                
            if(variable not in self.loopLines):
                self.loopLines[variable] = (0,0)
            
            if(variable not in self.maxLengthLine):
                self.maxLengthLine[variable] = 0
                
            if(variable not in self.aveLineLength):
                self.aveLineLength[variable] = 0
            
            uniqueLines = set(lines)
            
            for line in uniqueLines: #Look at each line once.
                #print(line)
                #Is this line the variable definition line?
                if(self.isDefinitionLine(variable, line)):
                    #Check if the variable definition appears with a global variable
                    self.externalOnDef[variable] = self.isExternalOnLine(line)
                    #Check if a literal appears on its definition line.
                    self.literalOnDef[variable] = self.isLiteralOnLine(line)
                else:
                    #Increment the count of lines that a global appears on if possible
                    if(self.isExternalOnLine(line)):
                        self.externalLines[variable].append(line)
                        
                    #Increment count of lines that a literal appears on if possible
                    if(self.isLiteralOnLine(line)):
                        self.literalLines[variable].append(line)
                
                
                #Do the for and while checks regardless of definition line status.         
                isFor = self.isForOnLine(line)
                isWhile = self.isWhileOnLine(line)    
                
                if(isFor):
                    tmp = self.loopLines[variable]
                    self.loopLines[variable] = (tmp[0] + 1, tmp[1])
                    
                if(isWhile):
                    tmp = self.literalLines[variable]
                    self.loopLines[variable] = (tmp[0], tmp[1] + 1)
             
             
            #Find the longest line this variable occurs on and the average linelength
            #print("Line lengths")
            (longest, ave) = self.lineMetrics(uniqueLines)
            #print(longest)
            #print(ave)
            assert(ave <= longest)
            self.maxLengthLine[variable] = longest
            self.aveLineLength[variable] = ave     

            
    
    def getMaxListCount(self, list):
        """
        Helper: return the max occurances of a list
        """
        #print("Max counting -> line list")
        #print(list)
        tmpMax = {}
        for item in list:
            if item in tmpMax:
                tmpMax[item] += 1
            else:
                tmpMax[item] = 1
                
        return max(tmpMax.values())
    
    def getVariables(self):
        """
        Return all non-global variables
        """
        nonGlobal = set()
        for key, def_key in self.revKeyMap.iteritems():
            if(not self.sA.isGlobal[key]):
                nonGlobal.add(def_key)
         
        return nonGlobal       
        
    #def getNameMetrics(self, name, def_scope):
    #    variable = (name, def_scope)
    #    return self.getNameMetrics(variable)
        
    def getNameMetrics(self, variable):
        """
        Helper: Returns the recorded metrics on variable
        
        Parameters
        ----------
        variable: tuple of the variable's name and its defining scope.
        
        Returns
        -------
        (# lines it appears on, max # times it appears on a line, 
        global appears on def line?, # of usage lines it appears on with a global,
        times it appears on a while line?, times it appears on a for line?,
        literal appears on def line?, # of usage lines it appears on with a literal,
        longest line in tokens it appears on, average line length in tokens of the lines it appears on)
        """
        
        numLines = len(set(self.lineList[variable]))
        maxLine = self.getMaxListCount(self.lineList[variable])
        externalDef = self.externalOnDef[variable]
        usageExternal = len(self.externalLines[variable])
        (usedInFor, usedInWhile) = self.loopLines[variable]
        literalDef = self.literalOnDef[variable]
        usageLiteral = len(self.literalLines[variable])
        maxLengthLine = self.maxLengthLine[variable]
        aveLineLength = self.aveLineLength[variable]
        return (numLines, maxLine, externalDef, usageExternal, usedInFor, usedInWhile, literalDef, usageLiteral, maxLengthLine, aveLineLength)
        
    
    def __str__(self):
        output = []
        output.append("KeyMap ---------------------------------------")
        output.append(self.keyMap.__str__())
        
        output.append("RevKeyMap ---------------------------------------")
        output.append(self.revKeyMap.__str__())
        
        output.append("lineList ---------------------------------------")
        output.append(self.lineList.__str__())

        output.append("externalLines ---------------------------------------")
        output.append(self.externalLines.__str__())
        output.append("externalOnDef ---------------------------------------")
        output.append(self.externalOnDef.__str__())
        output.append("loopLines ---------------------------------------")
        output.append(self.loopLines.__str__())
        output.append("literalOnDef ---------------------------------------")
        output.append(self.literalOnDef.__str__())
        output.append("literalLines ---------------------------------------")
        output.append(self.literalLines.__str__())
        
        output.append("posToLineMap ---------------------------------------")
        output.append(self.posToLineMap.__str__())
        output.append("externalVarLines ---------------------------------------")
        output.append(self.externalVarLines.__str__())
        output.append("literalsOnLines ---------------------------------------")
        output.append(self.literalsOnLines.__str__())
        output.append("forOnLines ---------------------------------------")
        output.append(self.forOnLines.__str__())
        output.append("whileOnLines ---------------------------------------")
        output.append(self.whileOnLines.__str__())
        output.append("lineLengthMap ---------------------------------------")
        output.append(self.lineLengthMap.__str__())
                
        return "\n".join(output)
        
