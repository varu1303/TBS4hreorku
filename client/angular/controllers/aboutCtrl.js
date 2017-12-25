angular.module('edApp')
.controller('aboutController', aboutController);

function aboutController($rootScope) {

  $rootScope.notLogged = true;
}