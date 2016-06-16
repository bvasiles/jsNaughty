if (typeof(Typist) == 'undefined') { Typist = {}; }


Typist.TargetController = function (aTarget) {
	this._target		= aTarget				|| Clipperz.Base.exception.raise('MandatoryParameter_3');
//	this._availableTime	= args.availableTime	|| Clipperz.Base.exception.raise('MandatoryParameter');

	MochiKit.Signal.connect(MochiKit.DOM.currentDocument(),	'onkeypress',	this, 'onkeypressDocumentHandler');

	this._deferredResult	= null;

	return this;
};

Typist.TargetController.prototype = {
	__class__: Typist.TargetController,

	//-------------------------------------------------------------------------

	'clear': function () {
		MochiKit.Signal.disconnectAllTo(this);
	},

	//-------------------------------------------------------------------------

	'target': function () {
		return this._target;
	},

	//-------------------------------------------------------------------------

	'onkeypressDocumentHandler': function (anEvent) {
		this.target().handleKey(anEvent.key()['string']);
		if (this.target().isComplete()) {
			this.handleTargetDone();
		}
	},

	//-------------------------------------------------------------------------

	'deferredResult': function () {
		if (this._deferredResult == null) {
			this._deferredResult = new Clipperz.Async.Deferred("TargetController.deferredResult", {trace:true});
			this._deferredResult.addBothPass(MochiKit.Base.method(this, 'clear'));
		}
		
		return this._deferredResult;
	},

	//-------------------------------------------------------------------------

	'placeTargetOnScreen': function () {
		this.target().update();
		MochiKit.Style.setElementPosition(this.target().node(), {
			x:((MochiKit.Style.getViewportDimensions()['w'] - MochiKit.Style.getElementDimensions(this.target().node())['w']) / 2),
			y:0
		});
	},

	//-------------------------------------------------------------------------

	'dropTarget': function () {
		var maxY;
		
		maxY = MochiKit.Style.getViewportDimensions()['h'] - MochiKit.Style.getElementDimensions(this.target().node())['h'] - 1;

		MochiKit.Visual.Move(this.target().node(), {
			x:0,
			y:maxY,
			duration:5,
			transition:MochiKit.Visual.Transitions.parabolic,
			afterFinish:MochiKit.Base.method(this, 'handleTargetMissed'),
			queue:'replace'
		});
		
	},

	//-------------------------------------------------------------------------

	'handleTargetDone': function () {
		MochiKit.Visual.Move(this.target().node(), {
			x:0,
			y:0,
			duration:0,
			transition:MochiKit.Visual.Transitions.parabolic,
			queue:'replace'
		});
		this.deferredResult().callback();
	},

	//.........................................................................

	'handleTargetMissed': function () {
		this.deferredResult().errback();
	},

	//-------------------------------------------------------------------------

	'run': function () {
		this.placeTargetOnScreen();
		this.dropTarget();
		
		return this.deferredResult();
	},

	//-------------------------------------------------------------------------
    'toString': MochiKit.Base.forwardCall("repr")
};
