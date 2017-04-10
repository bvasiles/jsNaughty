// TODO
// - Replace modal and tip widget with this widget
// * make middle section layer above bottom and top (css)
// * convert to table layout
// * tip positioning (css)
// * change "group" to "section"
// * change footer options to match class, i.e. status / message / controls
// * add code to add and remove classes when either head or foot are empty or all children are invisible (for css purposes)
(function( Quran, jQuery ) {
	jQuery.template('quran.box', '\
		<div class="box ${mode} ${addClass}">\
			<div class="outer">\
				<div class="inner">\
					<b class="tri"></b>\
					<div class="content">\
						<div class="mask"></div>\
						<a class="close">X</a>\
						<table class="box-table">\
							<thead class="box-head"></thead>\
							<tbody class="box-body"></tbody>\
							<tfoot class="box-foot"></tfoot>\
						</table>\
					</div>\
				</div>\
			</div>\
		</div>\
	');

	jQuery.template('quran.box.head.row', '\
		<tr class="box-row box-head-row ${ $item.class }">\
			<td class="box-cell box-head-cell margin"><div class="box-wrap box-head-wrap"></div></td>\
			<td class="box-cell box-head-cell middle" colspan="3"><div class="box-wrap box-head-wrap"></div></td>\
			<td class="box-cell box-head-cell margin"><div class="box-wrap box-head-wrap"></div></td>\
		</tr>\
	');

	jQuery.template('quran.box.body.row', '\
		<tr class="box-row box-body-row ${ $item.class }">\
			<td class="box-cell box-body-cell margin"><div class="box-wrap box-body-wrap"></div></td>\
			<td class="box-cell box-body-cell middle" colspan="3"><div class="box-wrap box-body-wrap"></div></td>\
			<td class="box-cell box-body-cell margin"><div class="box-wrap box-body-wrap"></div></td>\
		</tr>\
	');

	jQuery.template('quran.box.foot.row', '\
		<tr class="box-row box-foot-row ${ $item.class }">\
			<td class="box-cell box-foot-cell margin"><div class="box-wrap box-foot-wrap"></div></td>\
			<td class="box-cell box-foot-cell status">\
				<div class="box-wrap box-foot-wrap">\
					<img class="loading" src="/static/images/gif/status.loading.gif" alt="Loading"/>\
					<img class="error" src="/static/images/gif/status.error.gif" alt="Error"/>\
					<img class="ok" src="/static/images/gif/status.ok.gif" alt="OK"/>\
				</div>\
			</td>\
			<td class="box-cell box-foot-cell message"><div class="box-wrap box-foot-wrap"></div></td>\
			<td class="box-cell box-foot-cell control"><div class="box-wrap box-foot-wrap"><menu></menu></div></td>\
			<td class="box-cell box-foot-cell margin"><div class="box-wrap box-foot-wrap"></div></td>\
		</tr>\
	');

	jQuery.template('quran.box.foot.control', '\
		<button>{{html label}}</button>\
	');

	jQuery.template('quran.overlay', '\
		<div class="overlay"></div>\
	');

	jQuery.fn.box = function(options) {
		var self = this,
			args = jQuery.makeArray(arguments),
			instance, method;

		if (self.data('instance')) {
			if (method = args.shift())
				return self.each(function() {
					var element = jQuery(this),
						instance = element.data('instance');

					if (instance._created)
						instance[method].apply(instance, args);
				});
			else return self;
		}

		instance = function(element) {
			var self = this;

			self.element = element;
			self._create_JIT();
		};

		instance.prototype = {
			options: jQuery.extend({
				mode: 'modal',
				toggle: 'click',
				addClass: null
			}, options, {
				css: jQuery.extend({
					zIndex: 10000,
					zOverlay: 9998
				}, options.css, {
				}),
				position: options.position ? jQuery.extend({
					my: 'center top',
					at: 'center bottom'
				}, options.position, {
					collision: 'none none'
				}) : false,
				resizable: options.resizable ? jQuery.extend({
					handles: 'all'
				}, options.resizable, {
				}) : false,
				draggable: options.draggable ? jQuery.extend({
					handle: 'thead .box-wrap',
					cursor: 'move'
				}, options.draggable, {
				}) : false
			}),
			_create_JIT: function() {
				var self = this;

				self.element.parent().closest('div:visible, body').one('mousemove mousedown', jQuery.proxy(self, '_create_if'));
			},
			_create_if: function() {
				var self = this;

				if (!self._created)
					self._create();
			},
			_create: function() {
				var self = this,
					o = self.options;

				jQuery.extend(self, {
					jQ : {
						body : jQuery(document.body),
						window : jQuery(window),
						document : jQuery(document)
					}
				});

				if (o.section && o.section.primary) {
					self.primary = o.section.primary;
					delete o.section.primary;
				} else self.primary = 'primary';

				if (o.position && !o.position.of)
					o.position.of = self.element;

				if (o.mode == 'modal' && o.position && !o.position.using)
					o.position.using = function(position) {
						var scrollTop = self.jQ.window.scrollTop();
						position.top -= scrollTop;
						position.top += position.top < 0 ? scrollTop : 0;
						jQuery(this).css(position);
					};

				if (o.mode == 'tip' && o.position && !o.position.using)
					o.position.using = function(position) {
						position.top = self.element.height();
						jQuery(this).css(position);
					};

				if (o.mode == 'modal' && o.resizable && !o.resizable.start)
					o.resizable.start = function(event, data) {
						data.originalPosition.top -= self.jQ.window.scrollTop();
						data.position.top -= self.jQ.window.scrollTop();
					};


				self._toggle = {};

				if (typeof o.toggle == 'object') {
					if (typeof o.toggle.ev == 'string' && typeof o.toggle.fn == 'function')
						self._toggle.ev = o.toggle.ev, self._toggle.fn = o.toggle.fn;
					else if (o.toggle.length && typeof o.toggle[0] == 'string' && typeof o.toggle[1] == 'function')
						self._toggle.ev = o.toggle[0], self._toggle.fn = o.toggle[1];
				} else if (typeof o.toggle == 'function')
					self._toggle.ev = 'click', self._toggle.fn = o.toggle;
				else if (typeof o.toggle == 'string')
					self._toggle.ev = o.toggle;

				self._buildBox();

				if (self._toggle.ev) {
					self.element.bind(self._toggle.ev +'.box', function(event) {
						self._toggle.section = self._toggle.fn ? self._toggle.fn.apply(self, arguments) : undefined;

						if (self._toggle.section === false)
							return;
						else self.toggle(self._toggle.section);
					});
					self.box.bind(self._toggle.ev +'.box', function(event) {
						event.stopPropagation();
					});
				}

				if (o.events)
					jQuery.each(o.events, function(ev, fn) {
						self.box.bind(ev +'.box', function(event) {
							fn.apply(self, arguments);
						});
					});

				self._created = true;

				self.box.trigger('create.box');
			},
			_buildBox: function() {
				var self = this,
					o = self.options,
					css = jQuery.extend(o.css, { display: 'block', visibility: 'hidden' });

				self.box = jQuery.tmpl('quran.box', o).css(css);
				self.box.find('a.close').bind('click.box', jQuery.proxy(self, 'close'));

				self.table = {
					thead: self.box.find('thead'),
					tbody: self.box.find('tbody'),
					tfoot: self.box.find('tfoot')
				};

				if (o.mode == 'modal')
					self._buildOverlay();

				self._buildData();
				self._buildContent();

				self.open(self.primary, true);

				self.box.appendTo(self.element);

				if (o.position)
					self.box.position(o.position);
				if (o.resizable)
					self.box.resizable(o.resizable);
				if (o.draggable)
					self.box.draggable(o.draggable);

				self.close(true);

				self.box.css({ display: 'none', visibility: 'visible' });
			},
			_buildOverlay: function() {
				var self = this,
					o = self.options,
					overlay = self.element.find('> .overlay');

				self.overlay = overlay.length ? overlay : jQuery.tmpl('quran.overlay').appendTo(self.element);
				self.overlay.css({ zIndex: o.css.zOverlay? o.css.zOverlay : o.css.zIndex - 1 });
			},
			_buildData: function() {
				var self = this,
					o = self.options;

				self.data = {};

				self.data[self.primary] = {
					head : o.section && o.section[self.primary] && o.section[self.primary].head ? o.section[self.primary].head : o.head ? o.head : undefined,
					body : o.section && o.section[self.primary] && o.section[self.primary].body ? o.section[self.primary].body : o.body ? o.body : undefined,
					foot : o.section && o.section[self.primary] && o.section[self.primary].foot ? o.section[self.primary].foot : o.foot ? o.foot : undefined
				};

				if (o.section)
					jQuery.each(o.section, function(name, data) {
						self.data[name] = data;
					});
			},
			_buildContent: function() {
				var self = this,
					o = self.options;
					
				jQuery.each(self.data, function(name, data) {
					self.addSection(name, data);
				});
			},
			addSection: function(name, data) {
				var self = this,
					o = self.options,
					head = data.head ? jQuery.tmpl('quran.box.head.row', data.head, { class: name }) : jQuery(),
					body = data.body ? jQuery.tmpl('quran.box.body.row', data.body, { class: name }) : jQuery(),
					foot = data.foot ? jQuery.tmpl('quran.box.foot.row', data.foot, { class: name }) : jQuery();

				if (data.head)
					if (typeof data.head == 'string')
						head.find('.middle .box-wrap').html(data.head);
					else if (typeof data.head == 'object' && data.head.jquery)
						head.find('.middle .box-wrap').append(data.head.clone(true, true));
				if (data.body)
					if (typeof data.body == 'string')
						body.find('.middle .box-wrap').html(data.body);
					else if (typeof data.body == 'object' && data.body.jquery)
						body.find('.middle .box-wrap').append(data.body.clone(true, true));
				if (data.foot) {
					if (data.foot.status)
						foot.find('.status').addClass(data.foot.status);
					if (data.foot.message)
						if (typeof data.foot.message == 'string')
							foot.find('.message .box-wrap').html(data.foot.message);
						else if (typeof data.foot.message == 'object' && data.foot.message.jquery)
							foot.find('.message .box-wrap').append(data.foot.message.clone(true, true));

					if (data.foot.control)
						jQuery.each(data.foot.control, function(label, fn) {
							var control = jQuery.tmpl('quran.box.foot.control', { label: label });
							control.bind('click.box', jQuery.proxy(fn, self));
							foot.find('.control menu').append(control);
						});
				}

				head.hide().appendTo(self.table.thead);
				body.hide().appendTo(self.table.tbody);
				foot.hide().appendTo(self.table.tfoot);

				self.head = self.head ? self.head.add(head) : head;
				self.body = self.body ? self.body.add(body) : body;
				self.foot = self.foot ? self.foot.add(foot) : foot;
			},
			open: function(section, silent) {
				var self = this,
					o = self.options,
					section = section || self.section || self.primary,
					section = section == 'primary' && self.primary != 'primary' ? self.primary : section,
					head = self.head.hide().filter('.'+ section),
					body = self.body.hide().filter('.'+ section),
					foot = self.foot.hide().filter('.'+ section);

				window.___self = this;

				if (self.mode == 'modal')
					self.overlay.show();

				self.box.show();

				head = head.length ? head : self.head.filter('.'+ self.primary);
				body = body.length ? body : self.body.filter('.'+ self.primary);
				foot = foot.length ? foot : self.foot.filter('.'+ self.primary);

				head.css('display', 'table-row');
				body.css('display', 'table-row');
				foot.css('display', 'table-row');

				if (!head.length)
					self.table.tbody.addClass('border-top');
				else self.table.tbody.removeClass('border-top');
				if (!foot.length)
					self.table.tbody.addClass('border-bottom')
				else self.table.tbody.removeClass('border-bottom')

				self.section = section;

				if (!silent)
					self.box.trigger('open.box');
			},
			close: function(silent) {
				var self = this;

				if (self.mode == 'modal')
					self.overlay.hide();

				self.box.hide();

				if (!silent)
					self.box.trigger('close.box');
			},
			toggle: function(section) {
				var self = this;

				if (self.box.is(':hidden'))
					self.open(section);
				else self.close();
			},
			destroy: function() {
				var self = this;

				if  (self.mode == 'modal')
					self.overlay.hide();

				self.box.remove();
			},
			mask: function() {
				var self = this;

				self.box.find('.mask').show();
			},
			unmask: function() {
				var self = this;

				self.box.find('.mask').hide();
			},
			status: function(code, message) {
				var self = this,
					foot = self.foot.filter('.'+ self.section),
					status_elem = foot.find('.status'),
					message_elem = foot.find('.message .box-wrap');

				status_elem.attr('class', 'box-cell box-foot-cell status');

				if (message === undefined)
					message_elem.html(null);
				else {
					status_elem.addClass(code);
					message_elem.html(message)
				}
			}
		};

		return self.each(function() {
			var element = jQuery(this);

			element.data('instance', new instance(element));
		});
	};
})( Quran, jQuery );
