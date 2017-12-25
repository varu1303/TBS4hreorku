angular.module('edApp')
.controller('dashController', dashController);

function dashController($rootScope, tokenService, httpRequest, timestamp, $location) {

  $rootScope.notLogged = false;

  let payload = tokenService.getPayload(tokenService.getToken());
  $rootScope.name = payload.data.name;
  $rootScope.isAdmin = payload.data.admin;

  let dc= this;
  dc.allTicketGetError = false;
  dc.allOpenTicket = 0;
  dc.allTicketRaised = [];
  dc.limit = 15;
  dc.showStatus = 'all';

  dc.loadMore = function () {
    dc.limit += 15;
  }

  dc.viewTicket = function (id) {
    let view = '/viewTicket/'+id;
    $location.path(view);
  }

  httpRequest.allTickets()
    .then(res => {
      dc.allTicketRaised = res.data.data;
      dc.allRaisedTicket = dc.allTicketRaised.length;
      dc.allTicketRaised.forEach( (val, ind) => {
        val.date = timestamp.getFromId(val._id);
        if( val.status == true) 
          dc.allOpenTicket += 1;
      })
    })
    .catch(res => {
      dc.allTicketGetError = true;
    })


}