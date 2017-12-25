angular.module('edApp')
.controller('logoutController', logoutController);

function logoutController(tokenService, $location, $timeout, $rootScope) {

  tokenService.deleteToken();
  
  $timeout( function () {
    angular.element('#tag').triggerHandler('click');
    $location.path('/');
    
  }, 1000);

}