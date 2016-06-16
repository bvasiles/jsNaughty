define([
  'Util/Util'
], function(Util) {
  return NPMap.Util.Route = {
    /**
     * Performs a route operation.
     * @param {Array} stops
     * @return {Array}
     */
    route: function(stops, callback) {
      reqwest({
        error: function(error) {
          callback({
            message: 'The route failed. Please try again.',
            success: false
          });
        },
        success: function(response) {
          if (response && response.route && typeof response.route.boundingBox === 'object') {
            response.success = true;
            callback(response);
          } else if (response.info && response.info.messages && response.info.messages.length > 0) {
            callback({
              message: response.info.messages[0],
              success: true
            });
          } else {
            callback({
              message: 'The route operation could not be completed.',
              success: true
            });
          }
        },
        type: 'jsonp',
        url: 'http://open.mapquestapi.com/directions/v1/route?key=Fmjtd%7Cluub2l01nd%2Cal%3Do5-96121w&ambiguities=ignore&doReverseGeocode=false&narrativeType=html&countryBoundaryDisplay=true&destinationManeuverDisplay=true&stateBoundaryDisplay=true&from=Lancaster,PA&to=York,PA'
        //url: 'http://www.mapquestapi.com/directions/v1/route'
        //url: 'http://www.mapquestapi.com/directions/v1/route?key=&format=json&from=Lancaster,PA&to=York,PA'
      });
    }
  };
});