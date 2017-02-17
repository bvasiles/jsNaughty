feather.ns("cardmagic");
(function() {           
  cardmagic.handofcards = feather.Widget.create({
    name: "cardmagic.handofcards",
    path: "widgets/handofcards/",
    prototype: {
      onInit: function() {
        
      },
      resetHand: function() {
        //cardsInHand = [];
      },
      dealCard: function( newCard, nPlayerId ) {
        //nPlayerId 0 = Player1, 1 = Player2
        //Need a way to determine which player we are and then display this correctly
        newCard.widget.setInfo( newCard );
      },
      onReady: function() {

      }
    }
  });
})();