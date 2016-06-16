
(function(){
	'use strict';
	describe("remove.entry", function() {
		it( 'should open a database, add a store and add then remove an entry', function() {
			var start_time = new Date().getTime(),
				db_name = 'entry-remove-test-' + start_time,
				store_name = 'entry-remove-test-store-' + start_time,
				key_path = 'entry' + start_time,
				test_data = { test: 'entry-remove' },
				error = false,
				success = false,
				notify = false,
				ctx;	
			test_data[key_path] = 'entry-remove-' + start_time;
            beforeEach(function(done) {
            	dash.add.entry({
	                database: db_name,
	                store: store_name,
	                store_key_path: key_path,
	                data: test_data
	            })
	            (function(context) {
	                dash.remove.entry(context)
	                (function(context) {
	                    success = true;
	                    ctx = context;
	                    done();
	                }, function(context) {
	                    ctx = context;
	                    error = true;
	                    done();
	                }, function(context) {
	                    notify = true;
	                });
	            });
            })

			it('the remove.entry operation to finish', function() {
				describe('remove.entry should finish cleanly', function() {

					beforeEach(function(done) {
						this.context = ctx;
						this.success = success;
						this.error = error;
						this.notify = notify;
						this.dbname = db_name;
						this.storename = store_name;
						this.keypath = key_path;
						this.key = test_data[key_path];
						this.data = test_data;
						done();
					});
					
					it("remove.entry should be a success", function() {
						expect(this.notify).toBe(false);
						expect(this.error).toBe(false);
						expect(this.context.error).toBeUndefined();
						expect(this.success).toBe(true);
						expect(-1 !== this.context.db.objectStoreNames.indexOf(this.context.store)).toBe(true);
						expect(this.context.db.name).toBe(this.dbname);
						expect(this.context.objectstore.name).toBe(this.storename);
						expect(this.context.key).toBe(this.key);
					});

				});
			});

		});

	});
}());

