Ext.onReady(function(){
    var vp = new Ext.Viewport({
        layout : 'border',
        items  : [{
            ref          : 'qwertyPanel',
            region       : 'west',
            width        : 250,
            title        : 'QWERTY Panel',
            html         : 'Type QWERTY again to collapse me !',
            split        : true,
            collapsed    : true,
            collapseMode : 'mini'
        },{
            region           : 'center',
            contentEl        : 'content',
            preventBodyReset : true
        },{
            ref    : 'abcdPanel',
            region : 'south',
            height : 100,
            title  : 'Hold CTRL and press ABCD to update my title !',
            html   : 'Nothing here',
            split  : true
        }]
    });

    var map = new Ext.ux.KeySequenceMap(document, {
        sequence : 'qwerty',
        fn : function(){
            vp.qwertyPanel.toggleCollapse();
        }
    });
    map.addBinding({
        sequence : 'abcd',
        stopEvent : true,
        ctrl : true,
        fn : function(){
            vp.abcdPanel.setTitle('Hold Shift and press DCBA to update my title !');
            vp.abcdPanel.header.setStyle('color','red');
        }
    });
    map.addBinding({
        sequence : 'dcba',
        shift : true,
        fn : function(){
            vp.abcdPanel.setTitle('Hold CTRL and press ABCD to update my title !');
            vp.abcdPanel.header.setStyle('color','#15428B');
        }
    });
    map.addBinding({
        sequence : [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], //the konami code ^ ^ v v < > < > B A
        fn : function(){
            Ext.Msg.alert('Konami !', 'Congratulations ! You know the Konami code !');
        }
    })
});