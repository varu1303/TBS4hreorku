angular.module('edApp')
.controller('raiseController', raiseController);

function raiseController($rootScope, tokenService, httpRequest, $timeout) {

  $rootScope.notLogged = false;

  let payload = tokenService.getPayload(tokenService.getToken());
  $rootScope.name = payload.data.name;
  $rootScope.isAdmin = payload.data.admin;

  let rc= this;

  rc.tickAttempt = false;
  rc.tickRaised = false;
  rc.tickRaiseFail = false;
  rc.tickTitle = '';
  rc.tickDescription = '';

  rc.tickSubmit = function () {
    rc.tickAttempt = true;

    if (rc.tickTitle && rc.tickDescription) {
      rc.tickAttempt = false;
      let ticketDetail = {};
      ticketDetail.ticketTitle = rc.tickTitle;
      ticketDetail.ticketDescripton = rc.tickDescription;
      httpRequest.raiseTicket(ticketDetail)
        .then(res => {
          rc.tickTitle = '';
          rc.tickDescription = '';
          rc.tickRaiseFail = false;
          rc.tickRaised = true;
          $timeout( function () {
            rc.tickRaised = false;
          }, 4000);
        })
        .catch(res => {
          rc.tickRaiseFail = true;
          $timeout( function () {
            rc.tickRaiseFail = false;
          }, 5000);
        })
    }
  }

}