/*
Name: DocumentElement

Description: Represents a constituent element of a Smart Document. This is an abstract class, specialized elements can be instantiated.

Requires:

Provides:
    - DocumentElement

Part of: ProcessPuzzle Browser UI, Back-end agnostic, desktop like, highly configurable, browser font-end, based on MochaUI and MooTools. 
http://www.processpuzzle.com

Authors: 
    - Zsolt Zsuffa

Copyright: (C) 2011 This program is free software: you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation, either version 3 of the License, 
or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//= require_directory ../MochaUI
//= require_directory ../FundamentalTypes

var DocumentElement = new Class({
   Implements: [AssertionBehavior, Events, Options, TimeOutBehaviour],
   Binds: [
      'associateEditor', 
      'authorization', 
      'checkTimeOut', 
      'createHtmlElement', 
      'constructPlugin',
      'destroyHtmlElements',
      'destroyPlugin',
      'detachEditor',
      'finalizeConstruction', 
      'finalizeDestruction',
      'injectHtmlElement', 
      'onPluginConstructed', 
      'onPluginError'],   
   
   options: {
      componentName : "DocumentElement",
      defaultTag : "div",
      delay : 100,
      eventFireDelay : 2,
      idPrefix : "Desktop-Element-",
      idSelector : "@id",
      isEditable : false,
      isEditableSelector : "@isEditable",
      pluginSelector : "sd:plugin",
      referenceSelector : "@href",
      sourceSelector : "@source",
      styleSelector : "@elementStyle",
      tagSelector : "@tag"
   },
   
   //Constructor
   initialize: function( definitionElement, bundle, options ){
      this.assertThat( definitionElement, not( nil() ), "DocumentElement.definitionElement" );
      this.assertThat( bundle, not( nil() ), "DocumentElement.bundle" );
      this.setOptions( options );

      //Protected, private variables
      this.definitionElement = definitionElement;
      this.resourceUri = null;
      
      this.constructionChain = new Chain();
      this.contextElement;
      this.destructionChain = new Chain();
      this.editable;
      this.editor;
      this.elementFactory;
      this.error = null;
      this.htmlElement;
      this.id;
      this.logger = WebUILogger ? Class.getInstanceOf( WebUILogger ) : null;
      this.plugin;
      this.reference;
      this.resourceBundle = bundle;
      this.source;
      this.status = DocumentElement.States.INITIALIZED;
      this.style;
      this.tag;
      this.text;
      this.where;      
   },
   
   //Public mutators and accessor methods
   construct: function( contextElement, where ){
      if( this.status != DocumentElement.States.UNMARSHALLED ) 
         throw new UnconfiguredDocumentElementException( 'destroy', 'initialized' );
      this.logger.trace( this.options.componentName + ".construct() of '" + this.id + "'started." );
      this.assertThat( contextElement, not( nil() ), "DocumentElement.contextElement" );
      this.contextElement = contextElement;
      this.where = where;
      this.elementFactory = new WidgetElementFactory( contextElement, this.resourceBundle );
      this.startTimeOutTimer( 'construct' );
      this.compileConstructionChain();
      
      try{ this.constructionChain.callChain(); }
      catch( exception ){ this.revertConstruction( new DocumentElementConstructionException( this.id, { cause : exception })); }
   },
   
   destroy: function(){
      if( this.status == DocumentElement.States.INITIALIZED ) 
         throw new UnconfiguredDocumentElementException( 'destroy', 'initialized' );
      this.compileDestructionChain();
      this.destructionChain.callChain();      
   },
   
   onPluginConstructed: function(){
      this.constructionChain.callChain();
   },
   
   onPluginError: function( exception ){
      this.revertConstruction( exception );
   },
   
   unmarshall: function(){
      this.unmarshallProperties();
      this.unmarshallPlugin();
      this.status = DocumentElement.States.UNMARSHALLED;
   },

   //Properties
   getDefinitionElement: function() { return this.definitionElement; },
   getBind: function() { return this.bind; },
   getEditor: function() { return this.editor; },
   getError: function() { return this.error; },
   getHtmlElement: function() { return this.htmlElement; },
   getId: function() { return this.id; },
   getPlugin: function() { return this.plugin; },
   getReference: function() { return this.reference; },
   getResourceBundle: function() { return this.resourceBundle; },
   getSource: function(){ return this.source; },
   getState: function() { return this.status; },
   getStyle: function() { return this.style; },
   getTag: function() { return this.tag; },
   getText: function() { return this.text; },
   getResourceType: function() { return this.options.type; },
   getResourceUri: function() { return resourceUri; },
   isEditable: function() { return this.editable ? this.editable : this.options.isEditable; },
   isSuccess: function() { return this.error == null; },
   
   //Protected, private helper methods
   associateEditor: function(){
      if( this.isEditable() ){
         this.editor = DocumentElementEditorFactory.create( this, {} );
         this.editor.attach();
      }
      this.constructionChain.callChain();
   }.protect(),
   
   authorization: function(){
      this.editable = this.options.isEditable;
      this.constructionChain.callChain();
   }.protect(),
   
   compileConstructionChain: function(){
      this.constructionChain.chain( this.createHtmlElement, this.injectHtmlElement, this.constructPlugin, this.authorization, this.associateEditor, this.finalizeConstruction );
   }.protect(),
   
   compileDestructionChain: function(){
      this.destructionChain.chain( this.destroyPlugin, this.destroyHtmlElements, this.detachEditor, this.finalizeDestruction );
   }.protect(),
   
   constructPlugin: function(){
      if( this.plugin ){ this.plugin.construct( this.contextElement );
      }else this.constructionChain.callChain();
   }.protect(),
   
   createAnchorIfNeeded: function(){
      if( this.reference ){
         this.elementFactory.createAnchor( this.text, this.reference, null, this.htmlElement );
      }else {
         if( this.text ) this.htmlElement.appendText( this.resourceBundle.getText( this.text ));
      }
   }.protect(),
   
   createHtmlElement: function(){
      if( this.tag ){
         this.htmlElement = new Element( this.tag );
         if( this.id ) this.htmlElement.set( 'id', this.id );
         if( this.source ) this.htmlElement.set( 'src', this.source );
         if( this.style ) this.htmlElement.addClass( this.style );
         this.createAnchorIfNeeded();
      }
      this.constructionChain.callChain();
   }.protect(),
   
   deleteHtmlElement: function(){
      if( this.htmlElement ) {
         if( this.htmlElement.destroy ) this.htmlElement.destroy();
         this.htmlElement = null;
      }
   }.protect(),
   
   definitionElementAttribute: function( selector, defaultValue ){
      var attributeNode = XmlResource.selectNode( selector, this.definitionElement );
      if( attributeNode ) return attributeNode.value;
      else return defaultValue;
   }.protect(),
   
   destroyHtmlElements: function(){
      if( this.status == DocumentElement.States.CONSTRUCTED ) this.deleteHtmlElement();
      if( this.status <= DocumentElement.States.CONSTRUCTED )this.resetProperties();
      this.destructionChain.callChain();
   }.protect(),
   
   destroyPlugin: function(){
      if( this.plugin ) this.plugin.destroy();
      this.destructionChain.callChain();
   }.protect(),
   
   detachEditor: function(){
      if( this.editor ) this.editor.detach();
      this.destructionChain.callChain();
   }.protect(),
      
   finalizeConstruction: function(){
      this.stopTimeOutTimer();
      this.status = DocumentElement.States.CONSTRUCTED;
      this.constructionChain.clearChain();
      this.fireEvent( 'constructed', this, this.options.eventFireDelay );
   }.protect(),
   
   finalizeDestruction: function(){
      this.error = null;
      this.destructionChain.clearChain();
      this.status = DocumentElement.States.INITIALIZED;
      this.fireEvent( 'destructed', this, this.options.eventFireDelay );
   }.protect(),
   
   injectHtmlElement: function(){
      this.htmlElement.inject( this.contextElement, this.where );
      this.constructionChain.callChain();
   }.protect(),
   
   instantiateConstructionException : function( exception ){
      return new DocumentElementConstructionException( this.id, { cause : exception, source : this.options.componentName + ".revertConstruction()" });
   }.protect(),
   
   resetProperties: function(){
      this.id = null;
      this.htmlElement = null;
      this.reference = null;
      this.style = null;
      this.tag = null;
      this.text = null;
   }.protect(),
   
   revertConstruction: function( exception ){
      this.error = this.instantiateConstructionException( exception );
      this.stopTimeOutTimer();
      this.constructionChain.clearChain();
      if( this.plugin && this.plugin.getState() > DocumentElement.States.INITIALIZED ) this.plugin.destroy();
      this.deleteHtmlElement();
      this.status = DocumentElement.States.INITIALIZED;
      this.logger.error( this.error.getMessage() + this.error.stackTrace() );
      this.fireEvent( 'constructionError', this.error );
   }.protect(),

   timeOut : function( exception ){
      this.revertConstruction( exception );
   }.protect(),
   
   unmarshallId: function(){
      this.id = this.definitionElementAttribute( this.options.idSelector );
      if( !this.id ) this.id = this.options.idPrefix + (new Date().getTime());
      if( this.dataElementsIndex > 0 ) this.id += "#" + this.dataElementsIndex; 
   }.protect(),
   
   unmarshallIsEditable: function(){
      this.options.isEditable = parseBoolean( XmlResource.selectNodeText( this.options.isEditableSelector, this.definitionElement, null, this.options.isEditable ));
   }.protect(),
   
   unmarshallPlugin: function(){
      var pluginDefinition = XmlResource.selectNode( this.options.pluginSelector, this.definitionElement );
      if( pluginDefinition ){
         this.plugin = new DocumentPlugin( pluginDefinition, this.resourceBundle, { onConstructed : this.onPluginConstructed, onConstructionError : this.onPluginError } );
         this.plugin.unmarshall();
      }
   }.protect(),
   
   unmarshallProperties: function(){
      this.unmarshallId();
      this.unmarshallIsEditable();
      this.unmarshallReference();
      this.unmarshallSource();
      this.unmarshallStyle();
      this.unmarshallTag();
      this.unmarshallText();
   }.protect(),
   
   unmarshallReference: function(){
      this.reference = this.definitionElementAttribute( this.options.referenceSelector );
   }.protect(),
   
   unmarshallSource: function(){
      this.source = this.definitionElementAttribute( this.options.sourceSelector );
   }.protect(),
   
   unmarshallStyle: function(){
      this.style = this.definitionElementAttribute( this.options.styleSelector );
   }.protect(),
   
   unmarshallTag: function(){
      this.tag = this.definitionElementAttribute( this.options.tagSelector );
      if( !this.tag ) this.tag = this.options.defaultTag;
   }.protect(),
   
   unmarshallText: function(){
      this.text = XmlResource.determineNodeText( this.definitionElement );
      if( this.resourceBundle && this.text ) this.text = this.resourceBundle.getText( this.text.trim() );
      
      if( !this.text ) this.text = "";
   }
});

DocumentElement.States = { INITIALIZED : 0, UNMARSHALLED : 1, CONSTRUCTED : 2 };
