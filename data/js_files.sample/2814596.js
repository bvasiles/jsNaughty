    function ExampleClass() {
        Assert.isTrue(this instanceof ExampleClass);
        if (false === (this instanceof ExampleClass)) {
            return new ExampleClass();
        }
        this.mySubProperty = new ExampleSubClass();
    }

    function ExampleSubClass() {
        if (false === (this instanceof ExampleSubClass)) {
            return new ExampleSubClass();
        }
        this.ExampleSubProperty = 123;
    }


    function kk() {
        var i = 0;
        var j = 1;
        i = j;
        ExampleClass.prototype.jehna = "kukkuluuruu";
        ExampleClass.prototype.fiuuVauu = new ExampleSubClass();
        var jep = new ExampleClass();
        var jerTest = new ExampleClass();
        jerTest.mySubProperty.ExampleSubProperty
        var test = { val: 1, func: function () { return this.val; } };
        var testA = Object.create(test); 
    }

 (function(myns, $, undefined) {
    function ExampleClassXX() {
        Assert.isTrue(this instanceof ExampleClassXX);
        this.mySubProperty = new ExampleSubClassXX();
    }

    var kukka = new ExampleClassXX();
    myns.Vekkuli = kukka;
    myns.Ehki = "Kahvi";

    muilu = new function() {
        keeko : "miu",
        mako : "piu",
    };
    muilu.prototype.kenuVunkkari = function() {
        return this.keeko + this.mako;
    };

    function ExampleSubClassXX() {
        Assert.isTrue(this instanceof ExampleSubClassXX);
        this.ExampleSubProperty = 123;
    }

 }(window.myns = window.myns || {}, jQuery));


var person = new ExampleClass();

var owner = {
    kahvi: new ExampleClass(),
    pulla : new ExampleSubClass(),
};

    muilu = new function() {
        keeko : "miu",
        mako : "piu",
    };
    muilu.prototype.kenuVunkkari = function() {
        return this.keeko + this.mako;
    };

var kehvu = new muilu();
kehvu.    	
