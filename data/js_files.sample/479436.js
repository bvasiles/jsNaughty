
FEMhub.Menubar = Ext.extend(Ext.Toolbar, {
    defaultType: 'x-femhub-button',

    onRender: function() {
        FEMhub.Menubar.superclass.onRender.apply(this, arguments);
        this.el.on('mousemove', this.onMouseMove, this);
    },

    onMouseMove: function(evt) {
        var active = this.activeMenuBtn;

        if (active && active.menu.isVisible()) {
            var elt = evt.getTarget('table.x-btn', this.el);

            if (elt) {
                var btn = Ext.getCmp(elt.id);

                if (btn && btn != this.activeMenuBtn && !btn.disabled) {
                    this.activeMenuBtn.hideMenu();
                    this.activeMenuBtn = btn;
                    btn.showMenu();
                }
            }
        }
    },
});

Ext.reg('x-femhub-menubar', FEMhub.Menubar);

