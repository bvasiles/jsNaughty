Ext.define("MyApp.controller.CustomerProperties", {
    extend: "Ext.app.Controller",
    alias: "controller.customerproperties",
    stores: [ "Customers" ],
    views: [ "CustomerProperties" ],
    onOkClick: function(button, e, options) {
        var win = button.up("window");
        frm = win.down("form").getForm();
        var store = this.getCustomersStore();
        if (mode == "Insert") {
            customer = frm.getValues();
            store.insert(0, customer);
        } else {
            customer = frm.getRecord();
            frm.updateRecord(customer);
        }
        store.sync();
        win.destroy();
    },
    onCancelClick: function(button, e, options) {
        button.up("window").destroy();
    },
    edit: function(customer, grid) {
        var cp = Ext.create("MyApp.view.CustomerProperties", {});
        cp.down("form").getForm().loadRecord(customer);
        mode = "Update";
        this.getCustomersStore().setGrid(grid);
        cp.show();
    },
    insert: function(grid) {
        var cp = Ext.create("MyApp.view.CustomerProperties", {});
        mode = "Insert";
        this.getCustomersStore().setGrid(grid);
        cp.show();
    },
    init: function() {
        this.control({
            "button[id=btnOk]": {
                click: this.onOkClick
            },
            "button[id=btnCancel]": {
                click: this.onCancelClick
            }
        });
    },
    onLaunch: function() {},
    onControllerClickStub: function() {}
});
