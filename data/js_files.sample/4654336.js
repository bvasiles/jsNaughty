function GameObject(title,description) {
	this.title = title;
	this.description = description;
}

GameObject.prototype.get_title = function() {
	return this.title;
}

GameObject.prototype.generate_description = function() {
	return this.description;
}

function CentralTrading() {
	this.base = GameObject;
	this.base("Central Trading","");
	this.team_ore = {};
	this.position = {
		x: 0,
		y: 0,
		z: 0
	};
	this.prices = {
		'ORE': 10,
		'FIGHTER': 1000,
		'MINING': 100,
		'TRANSPORT': 200
	};
	this.item_objects = {
		'FIGHTER': function(team) {return new FighterShip(team);},
		'MINING': function(team) {return new MiningShip(team);},
		'TRANSPORT': function(team) {return new TransportShip(team);}
	};
}

CentralTrading.prototype = new GameObject;

CentralTrading.prototype.generate_description = function() {
	return this.prices;
};

CentralTrading.prototype.buy = function(team,item) {

	console.log("CentralTrading.prototype.buy: team="+team.color+",item="+item);

	if (typeof(this.prices[item]) == 'undefined') {
		console.log("CentralTrading: item " + item + " not valid.");
		return null;
	}

	if (team.balance < this.prices[item]) {
		console.log("CentralTrading: team balance " + team.balance + " less than item " + item + " cost of " + this.prices[item]);
		return null;
	}

	team.balance = team.balance - this.prices[item];

	return this.item_objects[item](team);

};

CentralTrading.prototype.sell = function(team,item,obj,count) {

	console.log("CentralTrading.prototype.sell: team="+team.color+",item="+item+",count="+count);

	var num = count || 1;

	if (typeof(this.prices[item]) == 'undefined') {
		console.log("CentralTrading: item " + item + " not valid.");
		return null;
	}

	team.balance = team.balance + this.prices[item] * num;

	delete obj;

}

function Asteroid() {
	this.base = GameObject;
	this.base("Asteroid","");
	this.position = {
		x: 0,
		y: 0,
		z: 0
	};
	this.team = null;
	this.unmined_ore = Math.floor(Math.random() * (100000 - 1000) + 1000);
	this.mined_ore = 0;
};

Asteroid.prototype = new GameObject;

Asteroid.prototype.generate_description = function() {
	var team;

	if (this.team == null) {
		team = "N/A";
	} else {
		team = this.team.color;
	}

	return {
		"Unmined Ore": this.unmined_ore,
		"Mined Ore": this.mined_ore,
		"Team": team
	};
};

function Fleet(team,position) {
	this.base = GameObject;
	this.base("Fleet","");
	this.team = team;
	this.position = position;
	this.fighter_ships = [];
	this.mining_ships = [];
	this.transport_ships = [];
	this.target = null;
	this.attack_target = false;
	this.automate_mining = false;
	this.automate_transport = false;
};

Fleet.prototype = new GameObject;

Fleet.prototype.generate_description = function() {
	return {
		"Strength" : Math.floor(this.get_strength()),
		"Speed": Math.floor(this.get_speed()),
		"Fighters": this.fighter_ships.length,
		"Mining": this.mining_ships.length,
		"Transport": this.transport_ships.length,
		"Team": this.team.color
	};
};

Fleet.prototype.add_ship = function(ship) {
	switch(ship.type) {
		case 'FIGHTER': {
			this.fighter_ships.push(ship);
			break;
		}
		case 'MINING': {
			this.mining_ships.push(ship);
			break;
		}
		case 'TRANSPORT': {
			this.transport_ships.push(ship);
			break;
		}
	}
};

Fleet.prototype.remove_fighters = function() {
	this.fighter_ships = [];
};

/*
  Remove a certain number of the fleets fighter ships based upon the
  weighting of the combat.
*/
Fleet.prototype.damage_fighters = function(weight) {
	this.fighter_ships = _.reduce(this.fighter_ships,function(new_ships,ship) {
		if(Math.random() < weight) {
			new_ships.push(ship);
		}
		return new_ships;
	},[],this);
};

/*
  Fleet strength is just the sum of all the ship strengths
*/
Fleet.prototype.get_strength = function() {
	return _.reduce(_.union(this.fighter_ships,this.mining_ships,this.transport_ships),
					function(total,ship) {
						total += ship.strength;
						return total;
					},0,this);
};

/*
  Fleet speed is average of the ship speeds
*/
Fleet.prototype.get_speed = function() {
	var total_speed = _.reduce(_.union(this.fighter_ships,this.mining_ships,this.transport_ships),
					function(total,ship) {
						total += ship.speed;
						return total;
					},0,this);
	return (total_speed/this.get_size());
};

Fleet.prototype.get_size = function() {
	return (this.fighter_ships.length + this.mining_ships.length + this.transport_ships.length);
}

function Ship(team) {
	this.team = team;
	this.strength;
	this.speed;
};

function MiningShip(team) {
	this.base = Ship;
	this.base(team);
	this.strength = 5;
	this.speed = 5;
	this.type = 'MINING';
}

function FighterShip(team) {
	this.base = Ship;
	this.base(team);
	this.strength = 50;
	this.speed = 10;
	this.type = 'FIGHTER';
}

function TransportShip(team) {
	this.base = Ship;
	this.base(team);
	this.strength = 10;
	this.speed = 10;
	this.ore_capacity = 100;
	this.stored_ore = 0;
	this.type = 'TRANSPORT';
}