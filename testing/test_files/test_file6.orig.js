feather.ns("cardmagic");

(function() {
    cardmagic.handofcards = feather.Widget.create({
        name: "cardmagic.handofcards",
        path: "widgets/handofcards/",
        prototype: {
            onInit: function() {},
            resetHand: function() {},
            dealCard: function(newCard, nPlayerId) {
                newCard.widget.setInfo(newCard);
            },
            onReady: function() {}
        }
    });
})();
