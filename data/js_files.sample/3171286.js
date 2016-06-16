//Joe McCourt
//4/14/12

// Project Euler problem 7
// By listing the first six prime numbers: 
// 2, 3, 5, 7, 11, and 13, 
// we can see that the 6th prime is 13.
// What is the 10 001st prime number?
function Prob7(){

	//Simple prime number check
	this.isPrime = function(number){
		var maxCheck = Math.floor(Math.sqrt(number));
		if(!(number%2)){return false;}
		for(var i = 3; i <= maxCheck; i+=2){
			if(!(number%i)){return false;}
		}

		return true;
	};

	//Brute force search
	//I don't think there is any other way
	this.eval = function(){
		var i = 1;
		var number = 1;
		while(i < 10001){
			number+=2;
			if(this.isPrime(number)){
				i++;
			}
		}
		return number;
	};
}