define(function(require) {
  'use strict';

  var module = require('../module');

  module.directive('depWelcome', depWelcome);

  //---

  function depWelcome() {

    var directive = {

      restrict: 'EA',
        // E - Element <dep-welcome>User</dep-welcome>
        // A - Attribute <div data-dep-welcome>User</div>
        // C - Class <div class="dep-welcome">User</div>

      //transclude: false,

      link: linkFunc

    };

    return directive;

    //---

    function linkFunc(scope, element, attrs) {
      var html = element.html();
      //console.log('depWelcome directive');
      element.html('Welcome: <strong>' + html + '</strong>');
    }

  }

});
