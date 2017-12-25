angular.module('edApp')
  .filter('reverse', function() {
    return function(items) {
      if(!items)
        return [];
      else
        return items.slice().reverse();
    };
  });