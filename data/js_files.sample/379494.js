describe("Tickets", function () {
	var ticketStore;

	beforeEach(function () {
		ticketStore = Ext.create('Spike.store.Tickets');
	});

	it('should load nested data from store', function () {
		runs(function () {
			ticketStore.load({
				callback: function () {
					this.completed = true;
					this.ticketCount = ticketStore.getCount();
					var ticket = ticketStore.getAt(0);
					var commentStore = ticket.comments();
					this.commentCount = commentStore.getCount();
				},
				scope: this
			});
		});

		waitsFor(function () {
			return this.completed;
		}, 'Server call', 1000);

		runs(function () {
			expect(this.ticketCount).toEqual(2);
			expect(this.commentCount).toEqual(2);
		});
	});

	it('should save tickets', function () {
		runs(function () {
			ticketStore.load({
				callback: function () {
					this.completed = true;
				},
				scope: this
			});
		});

		waitsFor(function () {
			return this.completed;
		}, 'Server call', 1000);

		runs(function () {
			ticketStore.getAt(0).set('description', 'changed 1');
			ticketStore.getAt(1).set('description', 'changed 2');
			ticketStore.sync();
		});
	});
});