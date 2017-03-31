(function( Dominion ) {
//Card builder used to describe cards
Dominion.CardBuilder = function(){
    this.card = {};

    this.supplyTypes = [ "Kingdom", "Common", "Victory", "Action" ];

    this.name = function(name){
        this.card.name = name;
        return this;
    };
    /*this.description = function(description){
     this.card.description = description;
     return this;
     };*/
    this.set = function(set){
        this.card.set = set;
        return this;
    };
    this.cost = function(cost){
        this.card.cost = cost;
        return this;
    };
    this.value = function(value){
        this.card.value = value;
        return this;
    };
    this.victory = function(victory){
        this.card.victory = victory;
        return this;
    };
    this.effect = function(effect){
        this.card.effect = effect;
        return this;
    };
    this.build = function(){
        return this.card;
    };
};
})( Dominion );