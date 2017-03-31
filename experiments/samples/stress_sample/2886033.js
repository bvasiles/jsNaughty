(function(Global, document, undefined) {

// define modules and tests
var app = Global.app;

module('Given a [sandbox.dom.create] method', {

	setup: function() {
		app.register('element constructor', function(sandbox) {
			return {
				testCreateElement: function() {
					return sandbox.dom.create('div');
				},

				testCreateElementWithProperty: function() {
					return sandbox.dom.create('a', { href: 'http://www.example.com/' });
				}
			};
		});

		app.start('element constructor');
	},

	teardown: function() {
		app.unregister();
	}

});

test("when it is called with the string of a tagname", function() {
	var testEl = app.module('element constructor').instance.testCreateElement();

	assertThat(testEl, is( object() ),  'then it should create a new Element');
	assertThat(testEl.nodeName.toLowerCase(), is( equalTo( 'div' ) ),  'and it should be the correct type of tag');
});

test("when it is called with the string of a tagname and a property object", function() {
	var testEl = app.module('element constructor').instance.testCreateElementWithProperty();

	assertThat(testEl, is( object() ),  'then it should create a new Element');
	assertThat(testEl.nodeName.toLowerCase(), is( equalTo( 'a' ) ),  'and it should be the correct type of tag');
	assertThat(testEl.href, is( equalTo( 'http://www.example.com/' ) ),  'and it should have a requested attribute with a correct value');
});

module('Given a [sandbox.dom.append] method', {

	setup: function() {
		var fixture = this.fixture = document.getElementById('qunit-fixture');
		var target = this.target = document.createElement('div');

		app.register('append function', function(sandbox) {
			return {
				testAppend: function() {
					return sandbox.dom.append(target, fixture);
				}
			};
		});

		app.start('append function');
	},

	teardown: function() {
		delete this.fixture;
		delete this.target;

		app.unregister();
	}

});

test("when it is called with an empty target element", function() {
	var testEl = app.module('append function').instance.testAppend();

	assertThat(this.fixture.children.length, is( equalTo( 1 ) ),  'then it should have appended the passed element');
	assertThat(this.fixture.innerHTML, is( equalTo( '<div></div>' ) ),  'and the innerHTML should be correct');
	assertThat(testEl, is( equalTo( this.target ) ),  'and it should have returned the target element');
});

test("when it is called with a target element contining another element", function() {
	this.fixture.innerHTML = '<p>this should still be here</p>';

	var testEl = app.module('append function').instance.testAppend();

	assertThat(this.fixture.children.length, is( equalTo( 2 ) ),  'then it should have appended the passed element');
	assertThat(this.fixture.innerHTML, is( equalTo( '<p>this should still be here</p><div></div>' ) ),  'then it should have appended the passed element');
	assertThat(testEl, is( equalTo( this.target ) ),  'and it should have returned the target element');
});

module('Given a [sandbox.dom.prepend] method', {

	setup: function() {
		var fixture = this.fixture = document.getElementById('qunit-fixture');
		var target = this.target = document.createElement('div');

		app.register('prepend function', function(sandbox) {
			return {
				testPrepend: function() {
					return sandbox.dom.prepend(target, fixture);
				}
			};
		});

		app.start('prepend function');
	},

	teardown: function() {
		delete this.fixture;
		delete this.target;

		app.unregister();
	}

});

test("when it is called with an empty target element", function() {
	var testEl = app.module('prepend function').instance.testPrepend();

	assertThat(this.fixture.children.length, is( equalTo( 1 ) ),  'then it should have appended the passed element');
	assertThat(this.fixture.innerHTML, is( equalTo( '<div></div>' ) ),  'and the innerHTML should be correct');
	assertThat(testEl, is( equalTo( this.target ) ),  'and it should have returned the target element');
});

test("when it is called with a target element contining another element", function() {
	this.fixture.innerHTML = '<p>this should still be here</p>';

	var testEl = app.module('prepend function').instance.testPrepend();

	assertThat(this.fixture.children.length, is( equalTo( 2 ) ),  'then it should have appended the passed element');
	assertThat(this.fixture.innerHTML, is( equalTo( '<div></div><p>this should still be here</p>' ) ),  'then it should have appended the passed element');
	assertThat(testEl, is( equalTo( this.target ) ),  'and it should have returned the target element');
});

module('Given a [sandbox.dom.byId] method');

test("when it is called with a specific element id", function() {
	var target = document.createElement('div');
	var targetId = target.id = 'elementToFind';

	document.getElementById('qunit-fixture').appendChild(target);

	app.register('id function', function(sandbox) {
		return {
			testById: function() {
				return sandbox.dom.byId(targetId);
			}
		};
	});

	app.start('id function');

	var testEl = app.module('id function').instance.testById();

	assertThat(testEl, is( equalTo( target ) ),  'then it should find the correct element');

	app.unregister();
});

module('Given a [sandbox.dom.byClass] method', {

	setup: function() {
		var scope = document.createElement('a');
		document.getElementById('qunit-fixture').appendChild(scope);

		var target = this.target = document.createElement('span');
		var targetClass = target.className = 'elementToFind';

		var detractor = document.createElement('span');
		detractor.className = 'elementToNotFind';

		scope.appendChild(target);
		scope.appendChild(detractor);

		app.register('getElements function', function(sandbox) {
			return {
				testByClassWithScope: function() {
					return sandbox.dom.byClass(targetClass, scope);
				},

				testByClass: function() {
					return sandbox.dom.byClass(targetClass);
				}
			};
		});

		app.start('getElements function');
	},

	teardown: function() {
		delete this.target;

		app.unregister();
	}

});

test("when it is called with a className and an element to search within", function() {
	var testEls = app.module('getElements function').instance.testByClassWithScope();
	assertThat(testEls.length, is( equalTo( 1 ) ),  'then it should find one element');

	var firstEl = testEls[0];
	assertThat(firstEl, is( equalTo( this.target ) ),  'and it should the target element');
});

test("when it is called with a className but no element to search within", function() {
	var testEls = app.module('getElements function').instance.testByClass();
	assertThat(testEls.length, is( equalTo( 1 ) ),  'then it should find one element');

	var firstEl = testEls[0];
	assertThat(firstEl, is( equalTo( this.target ) ),  'and it should the target element');
});

module('Given a [sandbox.dom.prop] method', {

	setup: function() {
		var target = this.target = document.createElement('span');

		app.register('prop function', function(sandbox) {
			return {
				testProp: function() {
					return sandbox.dom.prop(target, 'title', 'test title');
				}
			};
		});

		app.start('prop function');
	},

	teardown: function() {
		app.unregister();
	}

});

test("when it is called with a attribute value pair on and element", function() {
	var testEl = app.module('prop function').instance.testProp();

	assertThat(this.target.title, is( 'test title' ),  'then it should add the correct attribute and value');
	assertThat(this.target, is( equalTo( testEl ) ),  'and it should return the target element');
});

test("when it is called with a attribute value pair on an element with the property existing", function() {
	this.target.title = 'will be overwritten';

	var testEl = app.module('prop function').instance.testProp();

	assertThat(this.target.title, is( 'test title' ),  'then it should overwrite the correct attribute and value');
	assertThat(this.target, is( equalTo( testEl ) ),  'and it should return the target element');
});

})(this, this.document || {});
