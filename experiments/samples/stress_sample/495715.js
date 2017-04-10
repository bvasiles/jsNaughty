/***
|''Name:''|settings|
|''Description:''|Set preferences|
|''~CoreVersion:''|2.1.0|
***/

/*{{{*/
config.views.editor.defaultText = '';
config.options.chkAnimate = false;
config.options.chkDisableWikiLinks = true;
config.options.txtMaxEditRows = 20;

config.options.chkImportWorkspaceOnStartup = false;
config.options.chkBackstage = true;
config.options.	txtTheme = 'WikispacesTheme';

//config.macros.sync.syncStatusList.none.display = 'none';
//config.macros.sync.syncStatusList.changedServer.display = 'none';
//config.macros.sync.syncStatusList.changedLocally.display = 'none';

merge(config.views.wikified,{
	postedPrompt: "posted"});

// Initialise the session display groupings
var wikispacesTopicGroup = new TiddlerDisplayGroup();

var wikispacesTopicPattern = [
	{label:'topic', tag:'topic', count:1, require:null, openAt:null},
	{label:'message', tag:'message', count:0, require:'topic', openAt:'bottom'}];

wikispacesTopicGroup.setPattern(wikispacesTopicPattern); 
wikispacesTopicGroup.setGroupField('server.topic_id');

Story.prototype.taggedTemplate_chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler
Story.prototype.chooseTemplateForTiddler = function(title,template)
{
	// get default template from core
	var t = template==DEFAULT_EDIT_TEMPLATE ? 'EditTemplate' : 'ViewTemplate';
	var template = this.taggedTemplate_chooseTemplateForTiddler.apply(this,arguments);

	// if the tiddler to be rendered doesn't exist yet, just return core result
	var tiddler = store.getTiddler(title);
	if(!tiddler)
		return template;

	// look for template whose prefix matches a tag on this tiddler
	var p = config.options.txtTheme + "##"; // systemTheme section prefix
	for (i=0; i<tiddler.tags.length; i++) {
		var s = p + tiddler.tags[i] + t; // add tag prefix
		if(store.getTiddlerText(s)) {
			 return s;
		}
	}
	return template;
}

/*getTopicList = function(context,userParams)
{
	context.title = context.tiddler.title;
displayMessage("Getting topics for "+context.title);
	context.adaptor.getTopicList(context.title,context,null,config.macros.importWikispacesMessages.getTopicListCallback);
	return true;
	//return config.macros.importWikispacesMessages.getTopicList(context.tiddler.title,context);
};*/

/*config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	var userCallback = fields['server.workspace'] == 'tw-test' ? config.macros.importWikispacesMessages.getTopicList : null;
	var userCallbackParams = null;
	config.macros.importWorkspace.getTiddlersForContext(config.macros.importWorkspace.createContext(fields,null,userCallback,userCallbackParams));
};
*/

/*}}}*/
