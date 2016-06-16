var GoogleCheckout = require('../'),
	common = require('./common');

var gc = new GoogleCheckout(common.settings);

gc.createCart(function (err, cart) {
	cart.addItem(common.items[0]);
	cart.addItem(common.items[1]);
	cart.addShipMethod(common.shipMethods[0]);
	cart.addShipMethod(common.shipMethods[1]);

	cart.postCart(function (err, data) {
		console.log(data);
	},true);
});
