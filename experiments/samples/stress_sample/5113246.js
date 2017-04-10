window.fixingGrid = false;
Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', 'application/ext/src/ux');
Ext.require([
    '*',
    'Ext.ux.grid.FiltersFeature'
]);
Ext.onReady(function() {
  Ext.QuickTips.init();
  

  
  //******* MODELS **********
  Ext.define('Place', {
     extend: 'Ext.data.Model',
     fields: ['id', 'name', 'branch', 'google_name', 'address', 'email', 'phone1', 'phone2', 'lat', 'lng']
 });
 
 Ext.define('Meal', {
     extend: 'Ext.data.Model',
     fields: ['id', 'title', 'place', 'price', 'marks', 'componentes', 'status', 'discount', 'is_gluten', 'is_diabetes', 'is_cosher', 'category']
 });

    Ext.define('Category', {
        extend: 'Ext.data.Model',
        fields: ['id', 'title']
    });

  window.placesStore = new Ext.data.Store({
    model:'Place',
    proxy: {
         type: 'ajax',
         url: ajaxPrefix+'place/places',
         reader: {
             type: 'json'
         }
     },
     autoLoad: true 
  });

    window.categoriesStore = new Ext.data.Store({
        model:'Category',
        proxy: {
            type: 'ajax',
            url: ajaxPrefix+'meal/categories',
            reader: {
                type: 'json'
            }
        },
        autoLoad: true
    });

    window.mealsStore = Ext.create('Ext.data.Store', {
        model: 'Meal',
        proxy: {
         type: 'ajax',
         url: ajaxPrefix+'meal/meals',
         reader: {
             type: 'json',
             totalProperty : 'total',
             root : 'rows'
         }
        },
        autoLoad: true
      });





   var mealsPanel =  Ext.create('Ext.panel.Panel', {
        width: 750,

        title: '',
        items :[
            {xtype : 'splitbutton', margin: 5, text : tr('addMeal'), icon: 'application/icons/add.png', handler: function() {vegan.mealForms('save', {})}},
            {xtype : 'splitbutton', text : tr('editMeal'), icon: 'application/icons/cog_edit.png'}
        ]

    });
    var filters = {
        ftype: 'filters',
        // encode and local configuration options defined previously for easier reuse
        encode: true, // json encode the filter query

        // Filters are most naturally placed in the column definition, but can also be
        // added here.
        filters: [{
            type: 'boolean',
            dataIndex: 'visible'
        }]
    };


  var mealsGrid = Ext.create('Ext.grid.Panel', {
        store: mealsStore,
        stateful: true,
        collapsible: true,
        cls:  'meals-grid',
        features: [filters],
        multiSelect: true,
        stateId: 'stateGrid',
        columns: [
            {text  : 'id',flex : 1,hidden : true,sortable : false,dataIndex: 'id'},
            {text  : TR.mealTitle,flex     : 1,sortable : true,cls: 'title',dataIndex: 'title', filterable: true},
            {text  : TR.place,flex     : 1,sortable : true,dataIndex: 'place',cls: 'place',  filterable: true},
            {text  : tr('category'),flex     : 1,sortable : true,dataIndex: 'category',cls: 'category',  filterable: true},
            {text  : TR.price,flex     : 1,sortable : true,dataIndex: 'price',cls: 'price',  filterable: true, xtype: 'numbercolumn', format:'0.00'},
            {text  : TR.marks,flex     : 1,sortable : true,dataIndex: 'marks',cls: 'marks'},
            {text  : TR.components,flex     : 1,sortable : true,dataIndex: 'componentes',cls: 'componentes'},
            {text  : tr('status'),flex     : 1,sortable : true,dataIndex: 'status',cls: 'status', renderer : vegan.grisStatus},
            {text  : tr('discount'),flex     : 1,sortable : true,dataIndex: 'discount',cls: 'discount', renderer : vegan.grisDicount},
            {text  : tr('is_gluten'),flex     : 1,sortable : true,dataIndex: 'is_gluten',cls: 'is_gluten', renderer : vegan.grisProps},
            {text  : tr('is_diabetes'),flex     : 1,sortable : true,dataIndex: 'is_diabetes',cls: 'is_diabetes', renderer : vegan.grisProps},
            {text  : tr('is_cosher'),flex     : 1,sortable : true,dataIndex: 'is_cosher',cls: 'is_cosher', renderer : vegan.grisProps},
            {
                text : tr('action'),
                cls : 'action',
                menuDisabled: true,
                sortable: false,
                xtype: 'actioncolumn',
                cls : 'action',
                width: 50,
                items: [{
                    icon   : 'application/ext/icons/fam/delete.gif',
                    tooltip: TR.delete,
                    handler: function(grid, rowIndex, colIndex) {
                        vegan.deleteRow(grid, rowIndex, colIndex, 'meal')
                    }
                }, {
                    icon   : 'application/ext/icons/fam/cog_edit.png',
                    tooltip: TR.edit,
                    handler: function(grid, rowIndex, colIndex) {
                        vegan.editRow(grid, rowIndex, colIndex, 'meal')
                    }
                }]
            }
        ],

        width: 1000,
        title: TR.meals,
        listeners : {
          statesave : vegan.fixGrid
        },
        bbar: Ext.create('Ext.PagingToolbar', {
          store: mealsStore,
          displayInfo: true,
          displayMsg: 'Displaying topics {0} - {1} of {2}',
          emptyMsg: "No topics to display",
            }),
        viewConfig: {
            stripeRows: true,
            enableTextSelection: true
        }
    });


    var placesGrid = Ext.create('Ext.grid.Panel', {
        store: placesStore,
        stateful: true,
        collapsible: true,
        cls:  'places-grid',
        name : 'places',
        features: [filters],
        multiSelect: true,
        stateId: 'stateGrid',
        columns: [
            {text     : 'id',flex : 1,hidden : true,sortable : false,dataIndex: 'id'},

            {text     : tr('placeName'),flex     : 1,sortable : true,cls: 'name',dataIndex: 'name', filterable: true},
            {text     : tr('Branch'),flex     : 1,sortable : true,cls: 'branch',dataIndex: 'branch', filterable: true},
            {text     : tr('address'),flex     : 1,sortable : true,dataIndex: 'address',cls: 'address',  filterable: true},
            {text     : tr('email'),flex     : 1,sortable : true,dataIndex: 'email',cls: 'email',  filterable: true},
            {text     : tr('phone'),flex     : 1,sortable : true,dataIndex: 'phone1',cls: 'phone'},
            {text     : tr('phone2'),flex     : 1,sortable : true,dataIndex: 'phone2',cls: 'phone2'},
            {
                text : tr('action'),
                cls : 'action',
                menuDisabled: true,
                sortable: false,
                xtype: 'actioncolumn',
                cls : 'action',
                width: 50,
                items: [{
                    icon   : 'application/ext/icons/fam/delete.gif',
                    tooltip: TR.delete,
                    model: 'place',
                    handler: function(grid, rowIndex, colIndex) {
                        vegan.deleteRow(grid, rowIndex, colIndex, 'place');
                    }
                }, {
                    icon   : 'application/ext/icons/fam/cog_edit.png',
                    tooltip: TR.edit,
                    handler: function(grid, rowIndex, colIndex) {
                        vegan.editRow(grid, rowIndex, colIndex,'place');
                    }
                }]
            }
        ],

        width: 1000,
        title: tr('Places'),
        listeners : {
            statesave : vegan.fixGrid
        },

        viewConfig: {
            stripeRows: true,
            enableTextSelection: true
        }
    });

    Ext.create('Ext.tab.Panel', {
        width: 1000,
        id: 'tabpanel',

        renderTo: document.body,
        items: [{
            title: tr('mealsManagment'),
            id: 'mealsManagment',
            items : [vegan.mealForms('save'), mealsGrid]
        }, {
            title: tr('placesManagment'),
            id : 'placesManagment',
            items : [vegan.placeForms('save'), placesGrid]

        }]
    });

})