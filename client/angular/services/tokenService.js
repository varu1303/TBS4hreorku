angular.module('edApp')
  .service('tokenService', tokenService);


function tokenService ($window) {

  this.saveToken = function (token) {
    $window.localStorage['ed-token'] = token;
  }

  this.getPayload = function (token) {

    let payload = token.split('.')[1];
    payload = $window.atob(payload);
    payload = JSON.parse(payload);

  return payload;
  }

  this.getToken = function () {
    return $window.localStorage['ed-token'];
  }

  this.deleteToken = function () {
    $window.localStorage.removeItem('ed-token');
  }

  this.isAdmin = function () {
    var p = JSON.parse($window.atob($window.localStorage['ed-token'].split('.')[1]));
    return p.data.admin;
  }

  this.isLoggedIn = function () {
    if(!$window.localStorage['ed-token'])
      return false;

    return true;
  }

}