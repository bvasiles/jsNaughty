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
        self.globalVarLines = set() #Set of lines containing global variables
        self.literalsOnLines = set() #Set of lines containing a literal
        self.forOnLines = set() #Set of lines containing a for statement
        self.whileOnLines = set() #Set of lines containing a while statement
        
        self.processTokenList()
        
        #Map from keys of type (name, def_scope) (desired for output) -> [(name, flat_position)] (used by iB and sA)
        self.keyMap = {}
        #Reverse of above, each list entry has one item.
        self.revKeyMap = {}
        
        #Map for variables -> list of lines on which it appears
        #(name, def_scope) -> list of int
        self.lineList = {}

        #Map for variables (name, def_scope) -> number of lines on which it appears with a global (not including def)
        self.globalLines = {}
        #Map for variables (name, def_scope) -> does a global appear on its def line. (bool)
        self.globalOnDef = {}
        #Map for # of lines it appears on with a for or while statement
        #(name, def_scope) -> (for_count, while_count)
        self.loopLines = {}
        #(name, def_scope) -> is there a literal in the defining line?
        self.literalOnDef = {}
        #(name, def_scope) -> # of lines it appears where there is also a literal (not including def)
        self.literalLines = {}
        
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
                self.posToLineMap[pos] = self.iB.revFlatMat[position][0]
        
        return self.posToLineMap[position]
    
    
    def isGlobalOnLine(self, line):
        """
        Helper: Is there a global variable on this line.
        
        Parameters
        ----------
        line: integer of the line number
        
        Returns
        -------
        true if there is a global variable used on this line and false otherwise
        """
        if(len(self.globalVarLines) == 0):
            #Fill in the map
            for name_pos, globalBool in self.sA.isGlobal.iteritems():
                if(globalBool):
                    line = self.posToLine(name_pos[1])
                    self.globalVarLines.add(line)     
        else:
            return line in self.globalVarLines


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
        
        return self.iB.revFlatMat[self.sA.nameDefScope2pos[variable]][1] == line
    
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
            for line in set(lines): #Look at each line once.
            
                #Is this line the variable definition line?
                if(self.isDefinitionLine(variable, line)):
                    #Check if the variable definition appears with a global variable
                    self.globalOnDef[variable] = self.isGlobalOnLine(line)
                    #Check if a literal appears on its definition line.
                    self.literalOnDef = self.isLiteralOnLine(line)
                else:
                    #Increment the count of lines that a global appears on if possible
                    if(variable not in self.globalLines):
                        self.globalLines[variable] = 0
                    if(self.isGlobalOnLine(line)):
                        self.globalLines[variable] += 1
                        
                    #Increment count of lines that a literal appears on if possible
                    if(variable not in self.literalLines):
                        self.literalLines[variable] = 0
                    if(self.isLiteralOnLine(line)):
                        self.literalLines[variable] += 1
                
                
                #Do the for and while checks regardless of definition line status.         
                if(variable not in self.loopLines):
                    self.literalLines[variable] = (0,0)
                isFor = self.isForOnLine(line)
                isWhile = self.isWhileOnLine(line)    
                
                if(isFor):
                    tmp = self.literalLines[variable]
                    self.literalLines[variable] = (tmp[0] + 1, tmp[1])
                    
                if(isWhile):
                    tmp = self.literalLines[variable]
                    self.literalLines[variable] = (tmp[0], tmp[1] + 1)
            
    
    def getMaxListCount(self, list):
        """
        Helper: return the max occurances of a list
        """
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
        
    def getNameMetrics(self, name, def_scope):
        variable = (name, def_scope)
        return getNameMetrics(variable)
        
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
        literal appears on def line?, # of usage lines it appears on with a literal)
        """
        
        numLines = len(self.lineList[variable])
        maxLine = self.getMaxListCount(self.lineList)
        globalDef = self.globalOnDef[variable]
        usageGlobal = len(self.globalLines[variable])
        (usedInFor, usedInWhile) = self.loopLines[variable]
        literalDef = self.literalOnDef[variable]
        usageLiteral = len(self.literalLines[variable])
        return (numLines, maxLine, globalDef, usageGlobal, usedInFor, usedInWhile, literalDef, usageLiteral)
        
    
    def __str__(self):
        output = []
        output.append("KeyMap ---------------------------------------")
        output.append(self.keyMap.__str__())
        
        output.append("RevKeyMap ---------------------------------------")
        output.append(self.revKeyMap.__str__())
        
        output.append("lineList ---------------------------------------")
        output.append(self.lineList.__str__())

        output.append("globalLines ---------------------------------------")
        output.append(self.globalLines.__str__())
        output.append("globalOnDef ---------------------------------------")
        output.append(self.globalOnDef.__str__())
        output.append("loopLines ---------------------------------------")
        output.append(self.loopLines.__str__())
        output.append("literalOnDef ---------------------------------------")
        output.append(self.literalOnDef.__str__())
        output.append("literalLines ---------------------------------------")
        output.append(self.literalLines.__str__())
        
        output.append("posToLineMap ---------------------------------------")
        output.append(self.posToLineMap.__str__())
        output.append("globalVarLines ---------------------------------------")
        output.append(self.globalVarLines.__str__())
        output.append("literalsOnLines ---------------------------------------")
        output.append(self.literalsOnLines.__str__())
        output.append("forOnLines ---------------------------------------")
        output.append(self.forOnLines.__str__())
        output.append("whileOnLines ---------------------------------------")
        output.append(self.whileOnLines.__str__())
        
        return "\n".join(output)
        
