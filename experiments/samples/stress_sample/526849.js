QUnit.specify.globalApi = true;

QUnit.specify.extendAssertions({
    isGreaterThan: function(actual, expected, message) {
        ok(actual > expected, message);
    },
    isLessThan: function(actual, expected, message) {
        ok(actual < expected, message);
    }
});

QUnit.specify("jQuery.flextarea", function() {
    var specification = function() {
        
        // setup some helpers        

        // capture local references to current jquery objects
        // since the globals may get out of sync in the async
        // test runner
        var $ = window.$,
            jQuery = window.jQuery;
        var is14OrGreater = Number($.fn.jquery.split('.').slice(0,2).join('.')) >= 1.4;
        var binderMethod = is14OrGreater ? 'live' : 'bind';

        var fakeGlobal = {
            setTimeout: DeLorean.setTimeout
        };
    
        // shortcut for building up and breaking down stub forms
        var FormBuilder = {
            clear: function(){
                $('div#testbed form').empty();
                $('textarea').die('keydown');
                $('textarea').die('change');
                $('textarea').die('paste');
                $('textarea').die('maxlength');
            },
            addTextArea: function(name, value){
                var input = $('<textarea class="test" name="' + name + '" id="' + name + '">' + value + '</textarea>');
                $('div#testbed form').append(input);
                return input;
            }
        };
        
        describe("jQuery.flextarea", function(){
            after(function(){
                FormBuilder.clear();    
            });
            
            it("it should be equivalent to calling jQuery( jQuery.fn.flextarea.defaults.selector ).confine( options );", function(){
                FormBuilder.addTextArea("text1","text1val1");
                FormBuilder.addTextArea("text2","text2val2");
                FormBuilder.addTextArea("text3","text3val3");
                var originalFlextarea = $.fn.flextarea;
                try{
                    var passedOptions;
                    var selection;
                    $.fn.flextarea = function(opts) {
                        passedOptions = opts;                                        
                        selection = this;
                    };
                    $.extend($.fn.flextarea, {defaults:originalFlextarea.defaults});
                    var someOpts = {a:1,b:2};
                    $.flextarea(someOpts);
                    assert(someOpts).isSameAs(passedOptions);
                    assert(selection.size()).equals(3);  
                } finally {
                    $.fn.flextarea = originalFlextarea;
                }         
            });            
        });  
        describe("jQuery.fn.flextarea", function(){
            after(function(){
                FormBuilder.clear();    
            });
            
            describe("defaults", function(){
                it("it should have a value of 0 for minHeight", function(){
                    assert($.fn.flextarea.defaults.minHeight).equals(0);
                });
                it("it should have a value of 999999 for maxHeight", function(){
                    assert($.fn.flextarea.defaults.maxHeight).equals(999999);
                });
                it("it should have a value of null for minRows", function(){
                    assert($.fn.flextarea.defaults.minRows).isNull();
                });
                it("it should have a value of null for maxRows", function(){
                    assert($.fn.flextarea.defaults.maxRows).isNull();
                });
                it("it should have a value of false for shareMeasure", function(){
                    assert($.fn.flextarea.defaults.shareMesaure).isFalse();
                });
                it("it should have a value of ' MMMMMMMM' for padWord", function(){
                    assert($.fn.flextarea.defaults.padWord).equals(' MMMMMMMM');
                });
                it("it should have a value of 'textarea' for selector", function(){
                    assert($.fn.flextarea.defaults.selector).equals('textarea');
                });
                it("should have proper live setting (true if >= 1.4)", function(){
                    if(is14OrGreater) {
                        assert($.fn.flextarea.defaults.live).isTrue("should be true");
                    } else {
                        assert($.fn.flextarea.defaults.live).isFalse("should be false");                        
                    }                
                });                
            });
            
            it("it should use data-minheight html5 attribute over option when present", function(){
                var area = FormBuilder.addTextArea("text1","text1val1");
                area.attr('data-minheight', 70)
                    .flextarea({minHeight: 50});
                assert(area.data('_flextarea_context').minHeight).equals(70);
            });
            it("it should use data-minrows html5 attribute over option when present", function(){
                var area = FormBuilder.addTextArea("text1","text1val1");
                area.attr('data-minrows', 70)
                    .flextarea({minRows: 50});
                assert(area.data('_flextarea_context').minRows).equals(70);
            });
            it("it should use data-maxheight html5 attribute over option when present", function(){
                var area = FormBuilder.addTextArea("text1","text1val1");
                area.attr('data-maxheight', 70)
                    .flextarea({maxHeight: 50});
                assert(area.data('_flextarea_context').maxHeight).equals(70);
            });
            it("it should use data-maxrows html5 attribute over option when present", function(){
                var area = FormBuilder.addTextArea("text1","text1val1");
                area.attr('data-maxrows', 70)
                    .flextarea({maxRows: 50});
                assert(area.data('_flextarea_context').maxRows).equals(70);
            });
            
            given('keydown','change','paste','maxlength')
                .it("it should call jQuery.fn.flextareaResize 1 ms after event", function(eventName) {
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.flextarea({global: fakeGlobal, live: false});
                                        
                    var originalFlextareaResize = $.fn.flextareaResize;
                    try{
                        var passedOptions = null;
                        var callCount = 0;
                        
                        $.fn.flextareaResize = function() {
                            callCount++;
                        };
                        
                        area.trigger(String(eventName))
                        assert(callCount).equals(0);  
                        DeLorean.advance(10);
                        assert(callCount).equals(1);  
                    } finally {
                        $.fn.flextareaResize = originalFlextareaResize;
                    }                                                                                
                });
        });
        
        describe("jQuery.fn.flextareaResize", function(){
            after(function(){
                FormBuilder.clear();    
            });
            
            it("should throw an exception when specifying live when jq version doesn't support (<1.4 only)", function(){
                if(is14OrGreater) {
                    try{
                        $('textarea').flextarea({live:true});
                        assert.pass();
                    } catch(e) {
                        assert.fail('should have allowed live when 1.4');
                    }
                } else {
                    assert(function(){
                        $('textarea').flextarea({live:true});
                    }).throwsException('Use of the live option requires jQuery 1.4 or greater');
                }                
            });     
            
            if(is14OrGreater) {                
                it("should register paste, keydown, change, maxlength with live when live specified as true", function(){
                    var originalLive = $.fn.live;
                    try {
                        var calls = [];
                        $.fn.live = function(eventName) {
                            calls.push(eventName);
                            return this;
                        };
                        $('textarea').flextarea({live:true});                        
                        assert(calls).isSameAs(['keydown','change','paste','maxlength']);
                    } finally {
                        $.fn.live = originalLive;
                    }
                });
            }
            it("should register paste, keydown, change, maxlength with bind when live specified as false", function(){
                var originalBind = $.fn.bind;
                try {
                    var calls = [];
                    $.fn.bind = function(eventName) {
                        calls.push(eventName);
                        return this;
                    };
                    $('textarea').flextarea({live:false});
                    assert(calls).isSameAs(['keydown','change','paste','maxlength']);
                } finally {
                    $.fn.bind = originalBind;
                }                    
            });                   
            
            describe("when using minHeight", function(){
                it("it should size to min when text is less than min", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val('test')
                        .flextarea({global: fakeGlobal, live: false, minHeight: 50})
                        .css({height: '20px'});
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).equals(50);
                });
                it("it should size to text when text is greater than min", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false, minHeight: 50})
                        .css({height: '20px'});
                        
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(100);                    
                });
            });
            
            describe("when using minRows", function(){
                it("it should size to min when text is less than min", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val('test')
                        .flextarea({global: fakeGlobal, live: false, minRows: 5})
                        .css({height: '20px'});
                        
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(100);
                });
                it("it should size to text when text is greater than min", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val("a\nb\nc\nd\ne\na\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false, minRows: 5})
                        .css({height: '20px'});
                        
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(200);                    
                });
                it("it should take precedence over minHeight", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val('test')
                        .flextarea({global: fakeGlobal, live: false, minRows: 5, minHeight: 30})
                        .css({height: '20px'});
                                                
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(100);
                });
            });
            
            describe("when using maxHeight", function(){
                it("it should size to max when text is greater than max", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val('a\nb\nc\nd\ne')
                        .flextarea({global: fakeGlobal, live: false, maxHeight: 40})
                        .css({height: '20px'});                        
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).equals(40);
                });
                it("it should size to text when text is less than max", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false, maxHeight: 300})
                        .css({height: '20px'});
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(100);                    
                    assert(area.height()).isLessThan(200);                    
                });
            });    
            
            describe("when using maxRows", function(){
                it("it should size to max when text is greater than max", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val('a\nb\nc\nd\ne')
                        .flextarea({global: fakeGlobal, live: false, maxRows: 3})
                        .css({height: '20px'});                        
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(50);
                    assert(area.height()).isLessThan(100);
                });
                it("it should size to text when text is less than max", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false, maxRows: 10})
                        .css({height: '20px'});                        
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(100);
                    assert(area.height()).isLessThan(200);                    
                });
                it("it should take precedence over maxHeight", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1");
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false, maxRows: 3, maxHeight: 500})
                        .css({height: '20px'});                        
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                    
                    assert(area.height()).isGreaterThan(50);
                    assert(area.height()).isLessThan(100);
                });
            });
            
            describe("when textarea is expanded", function(){
                it("it should trigger resize event", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1"),
                        eventCount = 0;
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false, minHeight: 50})
                        .css({height: '20px'})                        
                        .bind('resize', function(){
                            eventCount++;                            
                        });
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                                        
                    assert(eventCount).isGreaterThan(0);
                });
                it("it should trigger grow event", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1"),
                        eventCount = 0;
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false, minHeight: 50})
                        .css({height: '20px'})                        
                        .bind('grow', function(){
                            eventCount++;                            
                        });
                        
                    assert(area.height()).equals(20);
                    
                    area.flextareaResize();
                                        
                    assert(eventCount).equals(1);
                });
            });
            describe("when textarea is reduced", function(){
                it("it should trigger resize event", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1"),
                        eventCount = 0;
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false })
                        .css({height: '200px'})                        
                        .bind('resize', function(){
                            eventCount++;                            
                        });
                        
                    assert(area.height()).equals(200);
                    
                    area.flextareaResize();
                                        
                    assert(eventCount).isGreaterThan(0);
                });
                it("it should trigger shrink event", function(){
                    var area = FormBuilder.addTextArea("text1","text1val1"),
                        eventCount = 0;
                    area.val("a\nb\nc\nd\ne")
                        .flextarea({global: fakeGlobal, live: false })
                        .css({height: '200px'})                        
                        .bind('shrink', function(){
                            eventCount++;                            
                        });
                        
                    assert(area.height()).equals(200);
                    
                    area.flextareaResize();
                                        
                    assert(eventCount).equals(1);
                });
            });            
        });
        if(is14OrGreater) {
            describe("when used with live", function(){
                after(function(){
                    FormBuilder.clear();                    
                });
                
                it("should still resize textareas added after activation", function(){
                    var events=[];
                    // bind first
                    $('textarea')
                        .flextarea({global:fakeGlobal})
                        .live('resize', function(){
                            events.push(this);                                                                                    
                        });
                        
                    // then add textareas
                    FormBuilder.addTextArea('t1','abcd');
                    FormBuilder.addTextArea('t2','abcd');
                    FormBuilder.addTextArea('t3','abcd');
                    
                    // type too much in all 3 newly added textareas
                    $('textarea#t1,textarea#t2,textarea#t3')
                        .css({height:'20px'})
                        .autotype('a{{enter}}b{{enter}}c{{enter}}d{{enter}}e');
                    
                    DeLorean.advance(20);
                        
                    assert(events.length).equals(3);
                    assert($('textarea#t1').height()).isGreaterThan(100);
                    assert($('textarea#t2').height()).isGreaterThan(100);
                    assert($('textarea#t3').height()).isGreaterThan(100);
                });
            });            
        }        
    };
    
    /**
     * naive replication of $.each since 
     * jquery is not defined at this point
     */
    var each = function(items, fn) {
        for(var i=0;i<items.length;i++) {
            var item = items[i];
            fn(item);
        }
    };
    
    /**
     * run entire test suite against multiple loaded versions
     * of jquery.
     * 
     * Assumes they have each been loaded and set to notConflict(true)
     * aliased as jq14, jq13, etc.
     */
    each(["1.3.2","1.4.1","1.4.2"], function(version) {
        describe("in jQ " + version, function(){
            $ = jQuery = window['jq_' + version.replace(/\./g,'_')];
            specification();                    
        });        
    });    
});