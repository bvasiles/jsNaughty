define([ TOKEN_LITERAL_STRING ], function(i) {
    return new i.Class({
        initialize: function(i) {
            var t = i.fieldController;
            this.entities = [];
            this.gameClock = i.gameClock;
            this.gameTick = i.gameTick;
            t.allEntities.forEach(function(i, t) {
                this.entities.push(t.constructEntityDescription(this.gameTick));
            }, this);
        }
    });
});
