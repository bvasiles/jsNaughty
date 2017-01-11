define([ TOKEN_LITERAL_STRING ], function(JS) {
    return new JS.Class({
        initialize: function(aGameInstance) {
            var fieldController = aGameInstance.fieldController;
            this.entities = [];
            this.gameClock = aGameInstance.gameClock;
            this.gameTick = aGameInstance.gameTick;
            fieldController.allEntities.forEach(function(key, entity) {
                this.entities.push(entity.constructEntityDescription(this.gameTick));
            }, this);
        }
    });
});
