/*
 * Enemy Paddle Controller - Deals with rendering and updating position of enemy paddle automatically
 */

var enemyPaddleController = {

	paddley: null, 
	paddleh: null,
	paddlew: null,
	paddlex: null,

	// Called on game start to calulate sizes based on field size
	init: function() {
		var self = this;
		self.paddley = HEIGHT / 2;
		self.paddleh = HEIGHT / 7;
		self.paddlew = WIDTH / 70;
		self.paddlex = WIDTH / 20;
	},

	// Update position based on ball position
	update: function() {
		var self = this;
		var bally = ballModel.y;
		var ballx = ballModel.x;


		// Once the ball is close enough begin to update the paddle position to strike ball
		if(ballx<WIDTH/1.25 && bally!==HEIGHT/2 && WIDTH!==0){
			if(bally-self.paddleh/2<self.paddley){
				self.paddley-=3;
			} else if (bally>self.paddley){
				self.paddley+=3;
			}
		}

		// If the paddle has exceeded the boundaries bring it back onto the field
		if(self.paddley+self.paddleh>=HEIGHT){
			self.paddley -= 5;
		} else if(self.paddley<=0){
			self.paddley += 5;
		}
		

		self.draw(self.paddlex, self.paddley, self.paddlew, self.paddleh);
	},

	// Draw the paddle
	draw: function(paddlex, paddley, paddlew, paddleh) {
		ctx.fillStyle = "#18CAE6";
		ctx.beginPath();
		ctx.rect(paddlex, paddley, paddlew, paddleh);
		ctx.closePath();
		ctx.fill();
	}
}