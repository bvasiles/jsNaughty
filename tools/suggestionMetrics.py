'''
Created on Feb 13, 2017

@author: Casey Casalnuovo

Helper file for a few functions evaluating properties of an identifier name
'''
import re

def getSuggestionStats(name):
    """
    Return a tuple of features about this suggestion name
    
    Parameters
    ----------
    name: the name of the suggestion
    
    Returns
    -------
    (length of name, does the name use camel case?, does it use underscores? begin with $?
    """
    return(len(name), hasCamelCase(name), underScore(name), dollarSign(name))

def hasCamelCase(name):
    pattern = "[a-z]{1}[A-Z]{1}"
    return re.search(pattern, name) != None

def dollarSign(name):
    return name.startswith("$")

def underScore(name):
    return "_" in name