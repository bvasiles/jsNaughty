/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright
 * 		2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ca.ui.CustomerContext.
jQuery.sap.declare("sap.ca.ui.CustomerContext");
jQuery.sap.require("sap.ca.ui.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new CustomerContext.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getPersonalizationPageName personalizationPageName} : string (default: 'AppCustomerContext')</li>
 * <li>{@link #getShowSalesArea showSalesArea} : boolean (default: false)</li>
 * <li>{@link #getPath path} : string (default: '/Customers')</li>
 * <li>{@link #getCustomerIDProperty customerIDProperty} : string (default: 'CustomerID')</li>
 * <li>{@link #getCustomerNameProperty customerNameProperty} : string (default: 'CustomerName')</li>
 * <li>{@link #getSalesOrganizationNameProperty salesOrganizationNameProperty} : string (default: 'SalesOrganizationName')</li>
 * <li>{@link #getDistributionChannelNameProperty distributionChannelNameProperty} : string (default: 'DistributionChannelName')</li>
 * <li>{@link #getDivisionNameProperty divisionNameProperty} : string (default: 'DivisionName')</li>
 * <li>{@link #getDialogTitle dialogTitle} : string</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ca.ui.CustomerContext#event:customerSelected customerSelected} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * This control allows you to open a dialog containing a list of customers for users to pick.
 * The chosen selected customer is persisted using sap.ushell services that shall be fully configured outside of this control.
 * 
 * The dialog can be open following two modes:
 * "select" : exiting without choosing a customer is firing the customerSelected event with a null customer before closing the dialog
 * "change" : exiting without choosing a customer is simply closing the dialog
 * 
 * When opening the dialog in "select" mode, if a customer has been persisted in a previous session, it will be retrieved and the dialog won't open at all.
 * 
 * @extends sap.ui.core.Control
 *
 * @author  
 * @version 1.16.4
 *
 * @constructor   
 * @public
 * @name sap.ca.ui.CustomerContext
 */
sap.ui.core.Control.extend("sap.ca.ui.CustomerContext", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"setModel", "select", "change", "reset"
	],

	// ---- control specific ----
	library : "sap.ca.ui",
	properties : {
		"personalizationPageName" : {type : "string", group : "Misc", defaultValue : 'AppCustomerContext'},
		"showSalesArea" : {type : "boolean", group : "Misc", defaultValue : false},
		"path" : {type : "string", group : "Misc", defaultValue : '/Customers'},
		"customerIDProperty" : {type : "string", group : "Misc", defaultValue : 'CustomerID'},
		"customerNameProperty" : {type : "string", group : "Misc", defaultValue : 'CustomerName'},
		"salesOrganizationNameProperty" : {type : "string", group : "Misc", defaultValue : 'SalesOrganizationName'},
		"distributionChannelNameProperty" : {type : "string", group : "Misc", defaultValue : 'DistributionChannelName'},
		"divisionNameProperty" : {type : "string", group : "Misc", defaultValue : 'DivisionName'},
		"dialogTitle" : {type : "string", group : "Misc", defaultValue : null}
	},
	events : {
		"customerSelected" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ca.ui.CustomerContext with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ca.ui.CustomerContext.extend
 * @function
 */

sap.ca.ui.CustomerContext.M_EVENTS = {'customerSelected':'customerSelected'};


/**
 * Getter for property <code>personalizationPageName</code>.
 * Name of your app that shall be unique.
 *
 * Default value is <code>AppCustomerContext</code>
 *
 * @return {string} the value of property <code>personalizationPageName</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getPersonalizationPageName
 * @function
 */

/**
 * Setter for property <code>personalizationPageName</code>.
 *
 * Default value is <code>AppCustomerContext</code> 
 *
 * @param {string} sPersonalizationPageName  new value for property <code>personalizationPageName</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setPersonalizationPageName
 * @function
 */


/**
 * Getter for property <code>showSalesArea</code>.
 * Display or not the customers sales area as well as its name and id.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showSalesArea</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getShowSalesArea
 * @function
 */

/**
 * Setter for property <code>showSalesArea</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowSalesArea  new value for property <code>showSalesArea</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setShowSalesArea
 * @function
 */


/**
 * Getter for property <code>path</code>.
 * Model path to the customer collection to be displayed
 *
 * Default value is <code>/Customers</code>
 *
 * @return {string} the value of property <code>path</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getPath
 * @function
 */

/**
 * Setter for property <code>path</code>.
 *
 * Default value is <code>/Customers</code> 
 *
 * @param {string} sPath  new value for property <code>path</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setPath
 * @function
 */


/**
 * Getter for property <code>customerIDProperty</code>.
 * Property name of the customer ID
 *
 * Default value is <code>CustomerID</code>
 *
 * @return {string} the value of property <code>customerIDProperty</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getCustomerIDProperty
 * @function
 */

/**
 * Setter for property <code>customerIDProperty</code>.
 *
 * Default value is <code>CustomerID</code> 
 *
 * @param {string} sCustomerIDProperty  new value for property <code>customerIDProperty</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setCustomerIDProperty
 * @function
 */


/**
 * Getter for property <code>customerNameProperty</code>.
 * Property name of the customer name
 *
 * Default value is <code>CustomerName</code>
 *
 * @return {string} the value of property <code>customerNameProperty</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getCustomerNameProperty
 * @function
 */

/**
 * Setter for property <code>customerNameProperty</code>.
 *
 * Default value is <code>CustomerName</code> 
 *
 * @param {string} sCustomerNameProperty  new value for property <code>customerNameProperty</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setCustomerNameProperty
 * @function
 */


/**
 * Getter for property <code>salesOrganizationNameProperty</code>.
 * Property name of the sales organization name
 *
 * Default value is <code>SalesOrganizationName</code>
 *
 * @return {string} the value of property <code>salesOrganizationNameProperty</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getSalesOrganizationNameProperty
 * @function
 */

/**
 * Setter for property <code>salesOrganizationNameProperty</code>.
 *
 * Default value is <code>SalesOrganizationName</code> 
 *
 * @param {string} sSalesOrganizationNameProperty  new value for property <code>salesOrganizationNameProperty</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setSalesOrganizationNameProperty
 * @function
 */


/**
 * Getter for property <code>distributionChannelNameProperty</code>.
 * Property name of the distribution channel name
 *
 * Default value is <code>DistributionChannelName</code>
 *
 * @return {string} the value of property <code>distributionChannelNameProperty</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getDistributionChannelNameProperty
 * @function
 */

/**
 * Setter for property <code>distributionChannelNameProperty</code>.
 *
 * Default value is <code>DistributionChannelName</code> 
 *
 * @param {string} sDistributionChannelNameProperty  new value for property <code>distributionChannelNameProperty</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setDistributionChannelNameProperty
 * @function
 */


/**
 * Getter for property <code>divisionNameProperty</code>.
 * Property name of the division name
 *
 * Default value is <code>DivisionName</code>
 *
 * @return {string} the value of property <code>divisionNameProperty</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getDivisionNameProperty
 * @function
 */

/**
 * Setter for property <code>divisionNameProperty</code>.
 *
 * Default value is <code>DivisionName</code> 
 *
 * @param {string} sDivisionNameProperty  new value for property <code>divisionNameProperty</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setDivisionNameProperty
 * @function
 */


/**
 * Getter for property <code>dialogTitle</code>.
 * Overrides the default Dialog title
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>dialogTitle</code>
 * @public
 * @name sap.ca.ui.CustomerContext#getDialogTitle
 * @function
 */

/**
 * Setter for property <code>dialogTitle</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sDialogTitle  new value for property <code>dialogTitle</code>
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#setDialogTitle
 * @function
 */


/**
 * Fired when a customer is selected in the list. The fired customer can be empty in case the user press the cancel button while the Customer Context has been open using select() 
 *
 * @name sap.ca.ui.CustomerContext#customerSelected
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'customerSelected' event of this <code>sap.ca.ui.CustomerContext</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ca.ui.CustomerContext</code>.<br/> itself. 
 *  
 * Fired when a customer is selected in the list. The fired customer can be empty in case the user press the cancel button while the Customer Context has been open using select() 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.ca.ui.CustomerContext</code>.<br/> itself.
 *
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#attachCustomerSelected
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'customerSelected' event of this <code>sap.ca.ui.CustomerContext</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @public
 * @name sap.ca.ui.CustomerContext#detachCustomerSelected
 * @function
 */

/**
 * Fire event customerSelected to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ca.ui.CustomerContext} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ca.ui.CustomerContext#fireCustomerSelected
 * @function
 */


/**
 * Setter for the control model
 *
 * @name sap.ca.ui.CustomerContext.prototype.setModel
 * @function

 * @type void
 * @public
 */


/**
 * Open the Customer Context dialog and fires a null customerSelected if the cancel button is clicked
 *
 * @name sap.ca.ui.CustomerContext.prototype.select
 * @function

 * @type void
 * @public
 */


/**
 * Open the Customer Context dialog
 *
 * @name sap.ca.ui.CustomerContext.prototype.change
 * @function

 * @type void
 * @public
 */


/**
 * Delete the user selected customer
 *
 * @name sap.ca.ui.CustomerContext.prototype.reset
 * @function

 * @type void
 * @public
 */


// Start of sap\ca\ui\CustomerContext.js
jQuery.sap.declare("sap.ca.ui.CustomerContext");
jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.List");
jQuery.sap.require("sap.m.ColumnListItem");
jQuery.sap.require("sap.m.ObjectIdentifier");
jQuery.sap.require("sap.ca.ui.utils.resourcebundle");

sap.ca.ui.CustomerContext.MODE = {Select:'Select', Change:'Change'};     //opening modes

//called right after Control instantiation
sap.ca.ui.CustomerContext.prototype.init = function () {

    //-------------- persistence relying on ushell personalisation services ----------------//
    this._oldValue = "";
    this._oPersService = null;
    this._bDialogTitleOverriden = false; //allows overriding of the dialog title

    this._oDialog = new sap.m.Dialog(this.getId()+"-ccDialog", {
        type:sap.m.DialogType.Standard,
        contentWidth:"25%",
        contentHeight:"350em"
    }).addStyleClass("sapCaUiCCD");

    if (jQuery.device.is.phone) {
        this._oDialog.setStretchOnPhone(true);
    }

    //------------ set accept & reject buttons -----------------
    this._oButtonOk = new sap.m.Button({
        text:sap.ca.ui.utils.resourcebundle.getText("CustomerContext.Ok"),
        press:jQuery.proxy(function () {
            if (this._oList.getSelectedItem()) {

                var oSelectedCustomer = this._oList.getSelectedItem().getBindingContext().getProperty();

                //save the customer into the personalization service
                if (this._oPersService) {
                    try {
                        var oSavePromise = this._oPersService.setPersData(JSON.stringify(oSelectedCustomer));

                        oSavePromise.done(function() {
                            jQuery.sap.log.info("CustomerContext: Customer '"+JSON.stringify(oSelectedCustomer)+"' successfully saved");
                        });
                        oSavePromise.fail(function(oError) {
                            jQuery.sap.log.error("CustomerContext: Error while saving customer info : " + oError.message);
                        });
                    }
                    catch (oError) {
                        jQuery.sap.log.error("CustomerContext: wasn't able to saved SelectedCustomer on personalization service "+ oError.message);
                    }
                }
                else {
                    jQuery.sap.log.error("CustomerContext: there is no service defined for saving the SelectedCustomer, did you set the personalizationPageName property? ");
                }

                this.fireCustomerSelected(oSelectedCustomer);
            }
            this._oDialog.close();
        }, this)
    });

    this._oDialog.setLeftButton(this._oButtonOk);

    this._oButtonCancel =  new sap.m.Button({
        text:sap.ca.ui.utils.resourcebundle.getText("CustomerContext.Cancel"),
        press:jQuery.proxy(this._onCancel, this)
    });

    this._oDialog.setRightButton(this._oButtonCancel);


    //------------- subheader (search field) --------------------
    var searchField = new sap.m.SearchField({
        placeholder:sap.ca.ui.utils.resourcebundle.getText("CustomerContext.Search"),
        width:"100%",
        layoutData:new sap.m.FlexItemData({growFactor:1}),
        liveChange:jQuery.proxy(this._onLiveSearch, this)
    });

    var oSubHeader = new sap.m.Bar(this._oDialog.getId()+"-searchField",{
        contentMiddle:[
            searchField
        ]
    });
    this._oDialog.setSubHeader(oSubHeader);


    //------------- build dialog content (list) ------------------------------
    this._oList = new sap.m.Table();

    //------------ column for sales area -------------------------------------
    this._oSalesAreaColumn = new sap.m.Column({
        hAlign:"Left",
        minScreenWidth:"5000px",
        demandPopin:true,
        header:new sap.m.Label({
            text:sap.ca.ui.utils.resourcebundle.getText("CustomerContext.SalesArea")
        }),
        visible:false
    });
    this._oList.applySettings({
        mode:sap.m.ListMode.SingleSelectMaster,
        columns:[
            new sap.m.Column({
                hAlign:"Left"
            }),
            this._oSalesAreaColumn
        ],
        items:{
            path:this.getPath(),
            factory: jQuery.proxy(this._getItemList,this)
        },
        noDataText: sap.ca.ui.utils.resourcebundle.getText("CustomerContext.NoData")
    });

    //------------- binds the list and the dialog together ------------------------------
    this._oDialog.addContent(this._oList);
    this._oDialog.attachAfterOpen(jQuery.proxy(function () {

        //if nothing is selected, select the first item
        if (!this._oList.getSelectedItem() && this._oList.getItems().length > 0) {
            this._oList.setSelectedItem(this._oList.getItems()[0], true);
        }

    }, this));
};


sap.ca.ui.CustomerContext.prototype.setDialogTitle = function (sValue, bInvalidate) {
    this._bDialogTitleOverriden = true;
    this.setProperty("dialogTitle", sValue, bInvalidate);
};

sap.ca.ui.CustomerContext.prototype.setPersonalizationPageName = function (sValue) {
    try {
        var personalizationService = sap.ushell.Container.getService("Personalization");
        this._oPersService = personalizationService.getPersonalizer({
            container : sValue,
            item : "SelectedCustomerContext"
        });
    }
    catch (oError) {
        jQuery.sap.log.error("CustomerContext: error while loading personalization service: "+ oError.message);
    }

    this.setProperty("personalizationPageName", sValue, false);
};

//setter for property ShowSalesArea: display or not the sales area from the customer
sap.ca.ui.CustomerContext.prototype.setShowSalesArea = function (bValue) {

    var _oldValue = this.getShowSalesArea();
    if (_oldValue !== !!bValue){
        this._oSalesAreaColumn.setVisible(!!bValue);

        this.setProperty("showSalesArea", bValue, false);
    }
};

//setter for property ShowSalesArea: display or not the sales area from the customer
sap.ca.ui.CustomerContext.prototype.setPath = function (sValue) {
    this._oList.bindItems(sValue, jQuery.proxy(this._getItemList,this));
    this.setProperty("path", sValue);
};

//set the customer list model
sap.ca.ui.CustomerContext.prototype.setModel = function (oModel) {

    /* static list + live search only : tranforms the model into a local JSON model */
    if (oModel instanceof sap.ui.model.odata.ODataModel) {
        oModel = this._prepareODataForLiveSearch(oModel);
    }
    else if (oModel instanceof sap.ui.model.json.JSONModel) {
        oModel = this._prepareJSONForLiveSearch(oModel);
    }

    this._oList.setModel(oModel);
};

//open the customer list for selecting a new value
sap.ca.ui.CustomerContext.prototype.select = function () {

    if (!this._oDialog.isOpen()) {

        //check if there is a customer persisted for that app
        if (this._oPersService) {
            try {

                var oReadPromise = this._oPersService.getPersData();

                oReadPromise.done(jQuery.proxy(function (sCustomer) { // Success callback

                   if (sCustomer && sCustomer !== "") {
                       var oCustomer = JSON.parse(sCustomer);

                        // set the right item into the list
                        var oList = this._oList;
                        var customerPropId = this.getCustomerIDProperty();
                        if (this._oList && this._oList.getItems() && this._oList.getItems().length > 0){
                            jQuery.each(this._oList.getItems(), function(index, o){
                                var c = o.getBindingContext();
                                if (c.getModel().getProperty(c.getPath())[customerPropId] == oCustomer[customerPropId]) {
                                    oList.setSelectedItem(o, true);
                                }
                            });
                        }

                        this.fireCustomerSelected(oCustomer);
                    }
                    else {
                        //if only 1 customer, we select it automatically without opening the dialog
                        //simulate a press on the button so the customer is selected and saved using personalization
                        if (this._oList.getItems().length == 1) {
                            this._oList.setSelectedItem(this._oList.getItems()[0], true);
                            this._oButtonOk.firePress();
                        }
                        else {
                            this._mode = sap.ca.ui.CustomerContext.MODE.Select;
                            if (this._bDialogTitleOverriden) {
                                this._oDialog.setTitle(this.getDialogTitle());
                            }
                            else {
                            this._oDialog.setTitle(sap.ca.ui.utils.resourcebundle.getText("CustomerContext.TitleSelect"));
                            }

                            this._oDialog.open();
                        }
                    }

                }, this));

                oReadPromise.fail(jQuery.proxy(function (oError) {
                    jQuery.sap.log.error("CustomerContext: error while using personalization service: "+ oError.message);
                    this.fireCustomerSelected(null);
                }, this));
            }
            catch (oError) {
                jQuery.sap.log.error("CustomerContext: error while loading personalization service: "+ oError.message);
                this.fireCustomerSelected(null);
            }
        }
    }
};

//open the customer list for changing a previously selected value
sap.ca.ui.CustomerContext.prototype.change = function () {

    if (!this._oDialog.isOpen()) {
        this._mode = sap.ca.ui.CustomerContext.MODE.Change;
        if (this._bDialogTitleOverriden) {
            this._oDialog.setTitle(this.getDialogTitle());
        }
        else {
        this._oDialog.setTitle(sap.ca.ui.utils.resourcebundle.getText("CustomerContext.TitleChange"));
        }

        this._oDialog.open();
    }
};

//reset (= save with empty) the customer into the personalization service
sap.ca.ui.CustomerContext.prototype.reset = function() {

    if (this._oPersService) {
        try {
            var oSavePromise = this._oPersService.setPersData("");

            oSavePromise.done(function() {
                jQuery.sap.log.info("CustomerContext: Customer successfully reset");
            });
            oSavePromise.fail(function(oError) {
                jQuery.sap.log.error("CustomerContext: Error while resetting customer context: " + oError.message);
            });
        }
        catch (oError) {
            jQuery.sap.log.error("CustomerContext: wasn't able to reset SelectedCustomer on personalization service "+ oError.message);
        }
    }
    else {
        jQuery.sap.log.error("CustomerContext: there is no service defined for resetting the SelectedCustomer, did you set the personalizationPageName property? ");
    }
};


/* ----------------------------------- private methods --------------------------------------------- */
// Factory function for list items
sap.ca.ui.CustomerContext.prototype._getItemList = function(){
    var aCells = [
        new sap.m.ObjectIdentifier({
            title:{
                parts:[
                    {path:this.getCustomerNameProperty()},
                    {path:this.getCustomerIDProperty()}
                ],
                formatter:function (sName, sId) {      //if 00000, don't display the id
                    var sFullName = sName;
                    if (parseInt(sId) !== 0) {
                        sFullName += " (" + sId + ")";
                    }
                    return sFullName;
                }
            }
        })
    ];
    if( this.getShowSalesArea()){
        aCells.push(new sap.m.Text({
            text:"{" + this.getSalesOrganizationNameProperty()+"}, {"+ this.getDistributionChannelNameProperty() +"}, {" + this.getDivisionNameProperty() + "}"
        }));
    }
    return new sap.m.ColumnListItem({
        cells: aCells
    });
};

//push the cancel button: behavior is different if you open the customer list in select or change mode
sap.ca.ui.CustomerContext.prototype._onCancel = function () {
    if (this._mode == sap.ca.ui.CustomerContext.MODE.Select) {
        this.fireCustomerSelected(null);
    }
    this._oDialog.close();
};


//enhance an odata model for the live search (creates a local json model in order to avoid backend calls onLiveSearch)
sap.ca.ui.CustomerContext.prototype._prepareJSONForLiveSearch = function (oModel) {

    var customerPath = this.getPath();
    if (customerPath.length > 1 && customerPath[0] == '/') {
        customerPath = customerPath.substring(1);
    }

    var oCustomers = oModel.getData()[customerPath];

    for (var i = 0; i < oCustomers.length; i++) {
        //enrich the model for the live search
        this._enrichModel(oCustomers[i]);
    }

    var oJsonData = {};
    oJsonData[customerPath] = oCustomers;
    oModel.setData(oJsonData);

    return oModel;
};

//create a unique field containing all others for live searching on all displayed information at once
sap.ca.ui.CustomerContext.prototype._enrichModel = function (oCustomer) {
    oCustomer["_searchString"] = "";
    if (oCustomer[this.getCustomerNameProperty()]) {
        oCustomer["_searchString"] += oCustomer[this.getCustomerNameProperty()];
    }
    if (oCustomer[this.getCustomerIDProperty()]) {
        oCustomer["_searchString"] += oCustomer[this.getCustomerIDProperty()];
    }
    if (this.getShowSalesArea()) {
        if (oCustomer[this.getSalesOrganizationNameProperty()]) {
            oCustomer["_searchString"] += oCustomer[this.getSalesOrganizationNameProperty()];
        }
        if (oCustomer[this.getDistributionChannelNameProperty()]) {
            oCustomer["_searchString"] += oCustomer[this.getDistributionChannelNameProperty()];
        }
        if (oCustomer[this.getDivisionNameProperty()]) {
            oCustomer["_searchString"] += oCustomer[this.getDivisionNameProperty()];
        }
    }

    return oCustomer;
};

//enhance an odata model for the live search (creates a local json model in order to avoid backend calls onLiveSearch)
sap.ca.ui.CustomerContext.prototype._prepareODataForLiveSearch = function (oModel) {

    var jsonModel = new sap.ui.model.json.JSONModel();
    var jsonResults = [];
    var oJsonData = {};

    var customerPath = this.getPath();
    if (customerPath.length > 1 && customerPath[0] == '/') {
        customerPath = customerPath.substring(1);
    }

    oModel.read(this.getPath(), null, [], false, jQuery.proxy(function (oData) {

        for (var key in oData.results) {
            //fill source ODataModel for the calling view
            oModel.oData[customerPath+"('" + oData.results[key][this.getCustomerIDProperty()] + "')"] = oData.results[key];

            //enrich the model for the live search
            jsonResults.push(this._enrichModel(oData.results[key]));
        }

        oJsonData[customerPath] = jsonResults;
        jsonModel.setData(oJsonData);

    }, this), function () {
    });

    return jsonModel;
};

//perform the filtering on the list
sap.ca.ui.CustomerContext.prototype._onLiveSearch = function (oEvent) {
    var searchValue = oEvent.getParameter("newValue");
    var aFilters = [];

    if (searchValue != "") {
        aFilters.push(new sap.ui.model.Filter("_searchString", sap.ui.model.FilterOperator.Contains, searchValue));
        this._oList.getBinding("items").filter(aFilters);

    }
    else {
        if (this._oldValue != ""){
            this._oList.getBinding("items").filter([]);
        }
    }

    this._oldValue = searchValue;
};

sap.ca.ui.CustomerContext.prototype.exit = function () {
    if (this._oButtonOk) {
        this._oButtonOk.destroy();
        this._oButtonOk = null;
    }

    if (this._oButtonCancel) {
        this._oButtonCancel.destroy();
        this._oButtonCancel = null;
    }

    if (this._oDialog) {
        this._oDialog.destroy();
        this._oDialog = null;
    }

};