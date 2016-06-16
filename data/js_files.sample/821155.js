/**
 * ContainerNode has some methods marked with @borrows which are borrowed from {@link Ext.tree.AsyncTreeNode} class. 
 * For more details on these methods look at the corresponding {@link Ext.tree.AsyncTreeNode} class.
 * 
 * <p>This class is the basic node for all containers nodes (having one or more children nodes).</p> 
 *  
 * @param {Object} config The node configuration object
 * @author Nikolai Babinski <niba@appflower.com>
 */
afStudio.view.inspector.ContainerNode = function(config) {
    this.loaded = config && config.loaded === true;
    this.loading = false;
    
    afStudio.view.inspector.ContainerNode.superclass.constructor.apply(this, arguments);

    this.addEvents(
	    /**
	    * @event beforeload
	    * Fires before this node is loaded, return false to cancel
	    * @param {Node} this This node
	    */
    	'beforeload',
    	
	    /**
	    * @event load
	    * Fires when this node is loaded
	    * @param {Node} this This node
	    */
    	'load'
    );
};

/**
 * Context menu "deleteAllChildren" item's text
 * @static deleteAllNodeCxtText
 * @type {String} 
 */
afStudio.view.inspector.ContainerNode.deleteAllNodeCxtText = 'Delete all children'

/**
 * @class afStudio.view.inspector.ContainerNode
 * @extends afStudio.view.inspector.TreeNode
 */
Ext.extend(afStudio.view.inspector.ContainerNode, afStudio.view.inspector.TreeNode, {
    /**
     * The loader used by this node (defaults to using the tree's defined loader)
     * @property loader
     * @type {afStudio.view.inspector.InspectorLoader}
     */
	
	//TODO refactor and make method more flexible by @Nik
	/**
	 * Template method.
	 * @override
	 */
	initContextMenu : function() {
		var I = afStudio.view.inspector;
		
		var _me = this,
			model = this.modelNode,
			nodes = model.nodeTypes,
			addText = I.TreeNode.addNodeCxtText,
			deleteText = I.TreeNode.deleteNodeCxtText,
			deleteAllText = I.ContainerNode.deleteAllNodeCxtText,
			mItems = [];
		
		//---
		Ext.iterate(nodes, function(n, idx) {
			var nodeName = Ext.isObject(n) ? n.name : n;
			mItems[idx] = {
				text: nodeName,
				node: nodeName,
				controll: 'add'
			};
		});
		
		if (mItems.length > 1) {
			mItems = [
			{	
				text: addText,
				iconCls: 'icon-add',
				menu: {
					items: mItems,
					listeners: {
						itemclick: function(item) {
			            	switch (item.controll) {
			            		case 'add':
			            			_me.addModelNode(item.node);
			            		break;
			            	}
						}
					}
				}
			}];
		} else {
			mItems[0].itemId = mItems[0].controll;
			delete mItems[0].controll;
			mItems[0].text = String.format('{0} {1}', addText, mItems[0].text);
			mItems[0].iconCls = 'icon-add';
		}
		 
		if (!model.isRequired() || model.isRequired() && model.hasMany()) {
			mItems.push({
				itemId: 'delete',
				text: deleteText,
				iconCls: 'afs-icon-delete'
			});
		}
		
		mItems.push({
			itemId: 'deleteAllChildren',
			text: deleteAllText,
			iconCls: 'afs-icon-delete'
		});
		//---
		
		var menu = new Ext.menu.Menu({
			ignoreParentClicks: true,
			items: mItems,
			listeners: {
				itemclick: function(item) {
	            	var node = _me;
            	
	            	switch (item.itemId) {
	            		case 'add':
        					node.addModelNode(item.node);
        				break;
	            		case 'deleteAllChildren' :
	            			node.removeAllModelNodes();
	            		break;
	            		case 'delete' :
	            			node.removeAllModelNodes(); //rename
	            			node.removeModelNode();
	            		break;
	            	}
				}
			}
		});
		
		this.contextMenu = menu;
	},
	//eo initContextMenu
	
	/**
	 * Creates and Appends child model node to this node's associated {@link modelNode} model.
	 * As the result will be created and added corresponding child tree-node to this node.
	 * @public
	 * @param {String} node The node being created and added
	 */
	addModelNode : function(node) {
		var mn = this.modelNode.createNode(node);
	},
	
	/**
	 * Removes all children model nodes associated with this node's {@link modelNode} model.
	 * As the result will be removed all children tree-nodes of this node.
	 * @public
	 */
	removeAllModelNodes : function() {
		this.modelNode.removeAll(true);
	},
	
	/**
	 * Cleaning all node's resources.
	 * @override
	 * @protected
	 * @param {Boolean} silent
	 */
    destroy : function(silent) {
        afStudio.view.inspector.ContainerNode.superclass.destroy.call(this, silent);
        Ext.destroy(this.contextMenu);
    },
	
	//@borrows Ext.tree.AsyncTreeNode methods
	
	/**
	 * @borrows
	 */
    expand : function(deep, anim, callback, scope) {
        if (this.loading) { // if an async load is already running, waiting til it's done
            var timer;
            var f = function() {
                if (!this.loading) { // done loading
                    clearInterval(timer);
                    this.expand(deep, anim, callback, scope);
                }
            }.createDelegate(this);
            timer = setInterval(f, 200);
            return;
        }
        if (!this.loaded) {
            if (this.fireEvent("beforeload", this) === false) {
                return;
            }
            this.loading = true;
            this.ui.beforeLoad(this);
            var loader = this.loader || this.attributes.loader || this.getOwnerTree().getLoader();
            if (loader) {
                loader.load(this, this.loadComplete.createDelegate(this, [deep, anim, callback, scope]), this);
                return;
            }
        }
        afStudio.view.inspector.ContainerNode.superclass.expand.call(this, deep, anim, callback, scope);
    },
    
    /**
     * Returns true if this node is currently loading
     * @borrows
     * @return {Boolean}
     */
    isLoading : function() {
        return this.loading;  
    },
    
    /**
     * @borrows
     */
    loadComplete : function(deep, anim, callback, scope) {
        this.loading = false;
        this.loaded = true;
        this.ui.afterLoad(this);
        this.fireEvent("load", this);
        this.expand(deep, anim, callback, scope);
    },
    
    /**
     * Returns true if this node has been loaded
     * @borrows
     * @return {Boolean}
     */
    isLoaded : function(){
        return this.loaded;
    },
    
    /**
     * @borrows
     * @override
     */
    hasChildNodes : function() {
        if (!this.isLeaf() && !this.loaded) {
            return true;
        } else {
            return afStudio.view.inspector.ContainerNode.superclass.hasChildNodes.call(this);
        }
    },

    /**
     * Trigger a reload for this node
     * @borrows
     * @param {Function} callback
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the callback is executed. Defaults to this Node.
     */
    reload : function(callback, scope) {
        this.collapse(false, false);
        while(this.firstChild){
            this.removeChild(this.firstChild).destroy();
        }
        this.childrenRendered = false;
        this.loaded = false;
        if (this.isHiddenRoot()) {
            this.expanded = false;
        }
        this.expand(false, false, callback, scope);
    }
});

/**
 * Adds "container" type to inspector tree nodes {@link afStudio.view.inspector.nodeType} object.
 */
afStudio.view.inspector.nodeType.container = afStudio.view.inspector.ContainerNode;