(function() {
  'use strict';

  angular.module('app').controller('ctrl.Hello', HelloCtrl);

  //----

  HelloCtrl.$inject = ['$scope'];

  function HelloCtrl(scope) {

    scope.hello = 'Angular JS - Hello World 09 :: With require.js';

  }

})();
