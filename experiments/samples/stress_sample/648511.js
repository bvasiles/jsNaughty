var AutoCaptcha = (function () {

	nano.rich();

	var AutoCaptcha = nano.implement(
		function (image) {
			this.picture = new Picture(image);
		}, {
			read : function () {
				try {
					AutoCaptcha.lastReaded = new Reader(this.picture).get();
					this.log('Капча прочитана: <code>' + AutoCaptcha.lastReaded + '</code>');
				} catch (e) {
					this.log('Не удалось прочитать капчу(', true);
				}
			},
			logWrapper : null,
			getLogWrapper : function () {
				if (!AutoCaptcha.logWrapper) {
					AutoCaptcha.logWrapper = nano().create('div').css({
						position : 'absolute',
						right : '10px',
						top   : '10px'
					}).appendTo('body');
				}
				return AutoCaptcha.logWrapper;
			},
			log : function (msg, fail) {
				var log = nano().create('div', {
					innerHTML : msg,
				})
				.css({
					background : '#cfc',
					border     : '1px solid #090',
					color      : '#090',

					font : '12px sans-serif',

					width : '200px',
					padding : '5px 15px',
					margin  : '1px',

					textAlign : 'center'
				})
				.appendTo(this.getLogWrapper());

				if (fail) log.css({
					background  : '#fee',
					borderColor : '#900',
					color       : '#900'
				});

				log.find('code').css('fontWeight', 'bold');

				setTimeout(function () {
					log.destroy();
				}, 2500);
			}
		}
	);

	return nano.extend(AutoCaptcha, {
		logWrapper : null,
		lastReaded : null,
	});
})();