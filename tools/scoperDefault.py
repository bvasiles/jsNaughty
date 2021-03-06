'''
Created on Feb 23, 2017

@author: Bogdan Vasilescu
'''

import json
import re
import subprocess
import time
PIPE = subprocess.PIPE


def scopepaths(nested, root_pth):
    '''
    In the AST with scoping information generated by UglifyJS (we are interested
    in the scope wherein a name is defined, i.e., a `scope` child of a `thedef`
    node; the scope where a name is currently used, i.e., a `scope` _not_ child 
    of a `thedef` node, can be different), there are two types of scope nodes:
    (1) pointers (references) - they are actual AST depths, e.g.,  
    {'$ref':'$["body"][0]["definitions"][0]["value"]["expression"]["body"][4]'}
    (2) actual scope objects/dictionaries ("this names's scope object is this").
    In order to be able to identify the actual scope objects (and to recognize 
    the pointers to them), we need their AST depths. We can't retrieve the 
    depths directly from the scope objects, so we first do a pass over the 
    entire tree to record for each scope object its depth.
    '''
    for key, value in nested.iteritems():
        # Record for each `scope` AST node (no matter where you 
        # encounter it) its root path, in the same format as the 
        # pointers: '$["body"][0]["definitions"][0]...'
        # `join_ref_key` converts a list of nodes in this format.

        # AST nodes are either dictionaries or lists. Each is 
        # unpacked differently. Descend in the tree until reaching 
        # leaves, which cannot be dictionaries or lists.
        if isinstance(value, dict):
            root_pth.append(key)
            value['pth'] = join_ref_key(root_pth)
            scopepaths(value, root_pth)
        
        elif isinstance(value, list):
            root_pth.append(key)
            for idx, subdict in enumerate(value):
                root_pth.append(idx)
                subdict['pth'] = join_ref_key(root_pth)
                scopepaths(subdict, root_pth)
            root_pth.pop()

    # Ascend back
    if root_pth:
        root_pth.pop()


def keypaths(nested):
    '''
    Convert a nested dictionary to a key-path format.
    For each leaf (key), retrieve its root path.
    Adapted from http://stackoverflow.com/a/18820433/1285620
    to handle the two types of nodes in our AST, dicts and lists.
    '''
    for key, value in nested.iteritems():
        if isinstance(value, dict):
            for subkey, subvalue in keypaths(value):
                yield [key] + subkey, subvalue
        elif isinstance(value, list):
            for idx, subdict in enumerate(value):
                for subkey, subvalue in keypaths(subdict):
                    yield [key, idx] + subkey, subvalue
        else:
            yield [key], value
            

def split_ref_key(str_key):
    '''
    Transform a reference pointer from the string format
    '$["body"][0]["definitions"][0]...["definitions"][0]["start"]'
    to a list of nodes. It's the reverse of `join_ref_key`.
    '''
    if str_key == '$':
        return []

    return [int(e) if e.isdigit() else e \
            for e in re.findall(r"[^\[\]\"]+", str_key[1:])]


def pad(value):
    '''
    Transform a list of nodes to the reference pointer string format.
    It's the reverse of `split_ref_key`.
    Input: [u'body', 0, u'definitions', 0, u'value', u'body', 0, ...]
    Output: u'$["body"][0]["definitions"][0]["value"]["body"][0]...'
    '''    
    if type(value).__name__ == 'int':
        return '[%d]' % value
    return '["%s"]' % value    


def join_ref_key(keys):
    return '$%s' % ''.join([pad(k) for k in keys])


# def origin(self, depths):
#     
#     # ...["orig"][0]
#     for depth in depths:
#         if split_ref_key(depth)[-2] == 'orig':
#             return depth
#     
#     # pth + ["thedef"]["scope"] = def_scope
    


class ScopeAnalyst:
    
    def __run(self, in_file_path, scoper_dir):
        # This is a hack at the moment. I wrote a simple JS script
        # that uses node.js to export the AST produced and used by 
        # UglifyJS internally to JSON format
        command = ['node', 'nodeScoper.js', in_file_path]
#         print(command)
        proc = subprocess.Popen(command, 
                                stderr=PIPE, stdout=PIPE, 
                                cwd=scoper_dir)
        out, _err = proc.communicate()
        
        if proc.returncode:
            raise Exception, _err
        
        return out
    
    
    def __init_ast(self):
        self.ast = json.loads(self.json_repr)
        
        # For each (name, start position) tuple, record its scope 
        # identifier (which will be a path in the AST above)
        self.name2defScope = {}
        self.nameDefScope2pos = {}
        self.name2useScope = {}
        self.name2pth = {}
        self.nameScope2pth = {}
        
        # For each name, record its scopes
        self.nameScopes = {}
        self.nameUseScopes = {}
        
        self.isGlobal = {}
        
        self.nameOrigin = {}
        
        # Annotate scope nodes with depth
        scopepaths(self.ast, [])
        self.ast['pth'] = '$'
      
        # Extract names and scopes
        for (pth, key) in keypaths(self.ast):
            # Iterate over all leaves
            
            # `name` leaves are interesting ...  
            if pth[-1] == 'name':
                
                # Get the parent of the `node` name; the parent  
                # contains the other attributes we need.
                parent = self.__get_ref_key(pth[:-1])
                
                # ... but only if they have `scope`, `thedef`,
                # and `start` siblings
                if parent.has_key('scope') and \
                        parent.has_key('thedef') and \
                        parent.has_key('start'):
                    
                    # Retrieve starting position for the name
                    start = self.__get_start(parent['start'])
                    
                    #print("Key:" + str(key) + " Start: " + str(start))
                    use_scope = self.__get_use_scope(parent['scope'])
                    self.name2useScope[(key, start)] = use_scope
                    
                    # Retrieve scope identifier
                    def_scope = self.__get_def_scope(parent['thedef'])
                    self.name2defScope[(key, start)] = def_scope
                    
                    self.nameDefScope2pos[(key, def_scope)] = start
                    
                    # Is name global (defined outside of this file)?
                    glb = self.__get_def_global(parent['thedef'])
                    self.isGlobal[(key, start)] = glb
                    
                    
                    #print("----------------------------------------------------------------")
                    #print("Path: " + str(pth))
                    #print("Key: " + str(key))
                    #print("Path: " + str(join_ref_key(pth)))
                    #print("-------------")
                    #print(pth[-2])
                    #print(pth[-3])
                    #print("-------------")
                    #1.if it contains references in this path, it can't be assigned to (key, def_scope)
                    #2.if it contains orig, it is the definition.
                    #print(start)
                    #print("Def_scope:" + def_scope)
                    #print("Use_scope:" + use_scope)
                    #print("----------------------------------------------------------------")
                    
                    # Keep track of each name's scopes to figure 
                    # out which names are overloaded
                    self.nameScopes.setdefault(key, set([]))
                    self.nameScopes[key].add(def_scope)
                    
                    self.nameUseScopes.setdefault((key, def_scope), set([]))
                    self.nameUseScopes[(key, def_scope)].add(use_scope)
                    
                    depth = parent.get('pth', None)
                    self.name2pth[(key, start)] = depth
                    
                    self.nameScope2pth.setdefault((key, def_scope), [])
                    self.nameScope2pth[(key, def_scope)].append(depth)
        
        
        for (name, def_scope), depths in self.nameScope2pth.iteritems():
            
            self.nameOrigin[(name, def_scope)] = depths[0]
            found = False
            
            # ...["orig"][0]
            for depth in depths:
                if split_ref_key(depth)[-2] == 'orig':
                    self.nameOrigin[(name, def_scope)] = depth
                    found = True
                    break
    
            if not found:
                for depth in depths:
                    # pth + ["thedef"]["scope"] = def_scope
                    if depth + '["thedef"]["scope"]' == def_scope:
                        self.nameOrigin[(name, def_scope)] = depth
                        break
    
    
    def __init__(self, in_file_path, scoper_js_path=None):
        if scoper_js_path is None:
            import os
            scoper_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir, 'node_scoper'))
        else:
            scoper_dir = scoper_js_path
        
        
        self.json_repr = self.__run(in_file_path, scoper_dir)
#         self.json_repr = self.__web_run(open(in_file_path).read(), scoper_dir)

        self.__init_ast()
            
        

    '''Descend in the tree given a list of nodes'''
    def __get_ref_key(self, keys):
        sd = self.ast
        try:
            for key in keys:
                sd = sd[key]
        except:
            return {}
        return sd
    
    
    def __ref_or_not(self, d):
        if d.has_key('$ref'):
            return self.__get_ref_key(split_ref_key(d['$ref']))
        return d


    def __get_use_scope(self, d):
        return d.get('$ref', d.get('pth', None))
                
            
    def __get_def_scope(self, d):
        thedefref = d.get('$ref', None)
        if thedefref:
            return self.__get_ref_key(split_ref_key(thedefref)).get('scope', {}).get('pth', None)
        else:
            return d.get('scope', {}).get('pth', None)
        return None
        
        
    def __get_def_global(self, d):
        thedefref = d.get('$ref', None)
        if thedefref:
            return self.__get_ref_key(split_ref_key(thedefref)).get('global', False)
        else:
            return d.get('global', False)
        return None
            
            
    def __get_start(self, d):
        return self.__ref_or_not(d).get('pos', None)
    
    def __get_end(self, d):
        return self.__ref_or_not(d).get('endpos', None)
    
    
    def resolve_scope(self):
        return self.name2defScope


    def resolve_use_scope(self):
        return self.name2useScope
    
    
    def resolve_path(self):
        return self.name2pth


    def is_overloaded(self, v):
        return len(self.nameScopes.get(v, set([]))) > 1

    def hasMinifiableVariables(self):
        """
        Returns true if there is are any local variables to renaming,
        false otherwise.
        """
        #print(self.isGlobal)
        #print(self.isGlobal.values)
        if(len(self.isGlobal) == 0):
            return False

        return not reduce((lambda x, y: x and y), self.isGlobal.values())
    
    def getMinifiableLines(self, iB):
        """
        Returns a set of line numbers that mark what lines hae variables
        that can be minified.
        """
        localLines = set()
        for name_pos, global_check in self.isGlobal.iteritems():
            if(global_check): #Skip globals
                continue
            #print(name_pos)
            #print(iB.revTokMap)
            #print("----------")
            #print(iB.revFlatMat)
            localLines.add(iB.revTokMap[iB.revFlatMat[name_pos[1]]][0])
        
        return localLines


    def __str__(self):
        '''
        self.name2defScope = {}
        self.nameDefScope2pos = {}
        self.name2useScope = {}
        self.name2pth = {}
        self.nameScope2pth = {}
        
        # For each name, record its scopes
        self.nameScopes = {}
        
        self.isGlobal = {}
        
        self.nameOrigin = {}
        '''
        output = []
        output.append("--------------------name2defScope--------------------")
        output.append("\n".join([str(key) + " : " + str(item) for key, item in self.name2defScope.items()]))
        output.append("--------------------nameDefScope2pos--------------------")
        output.append("\n".join([str(key) + " : " + str(item) for key, item in self.nameDefScope2pos.items()]))
        output.append("--------------------name2useScope--------------------")
        output.append("\n".join([str(key) + " : " + str(item) for key, item in self.name2useScope.items()]))
        output.append("--------------------name2pth--------------------")
        output.append("\n".join([str(key) + " : " + str(item) for key, item in self.name2pth.items()]))
        output.append("--------------------nameScope2pth--------------------")
        output.append("\n".join([str(key) + " : " + str(item) for key, item in self.nameScope2pth.items()]))
        output.append("--------------------nameScopes--------------------")
        output.append("\n".join([str(key) + " : " + str(item) for key, item in self.nameScopes.items()]))
        output.append("--------------------isGlobal--------------------")
        output.append(self.isGlobal.__str__())
        output.append("--------------------nameOrigin--------------------")
        output.append("\n".join([str(key) + " : " + str(item) for key, item in self.nameOrigin.items()]))
        return "\n".join(output)
        


class WebScopeAnalyst(ScopeAnalyst):

    def __init__(self, input_text, scoper_js_path=None):
        start = time.time()
        if scoper_js_path is None:
            import os
            scoper_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir, 'web_scoper'))
        else:
            scoper_dir = scoper_js_path
        
        self.json_repr = self.__web_run(input_text, scoper_dir)

        self._ScopeAnalyst__init_ast()
        end = time.time()
        self.build_time = end - start


    def __web_run(self, input_text, scoper_dir):
        # This is a hack at the moment. I wrote a simple JS script
        # that uses node.js to export the AST produced and used by 
        # UglifyJS internally to JSON format
        command = ['node', 'nodeScoper.js']

        proc = subprocess.Popen(command, 
                                stderr=PIPE, stdout=PIPE, stdin=PIPE, 
                                cwd=scoper_dir)
        out, _err = proc.communicate(input=input_text)
        
        if proc.returncode:
            raise Exception, _err
        
        return out
    
    
        
        
