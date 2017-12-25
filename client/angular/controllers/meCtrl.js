angular.module('edApp')
.controller('meController', meController);

function meController($rootScope, tokenService, httpRequest, $location, timestamp) {

  let payload = tokenService.getPayload(tokenService.getToken());
  $rootScope.name = payload.data.name;
  $rootScope.isAdmin = payload.data.admin;

  let mc = this;

  mc.isAdmin = payload.data.admin;

  mc.phoneNumber = payload.data.phoneNumber;
  mc.emailId = payload.data.emailId;

  mc.adminAssignedTicket = 0;
  mc.adminOpenTicket = 0;
  mc.userRaisedTicket = 0;
  mc.userOpenTicket = 0;
  mc.lockClicked = false;
  mc.changeDone = false;
  mc.changeNoMatch = false;
  mc.successReset = false;
  mc.failReset = false;
  mc.getTicketError = false;
  mc.newPass = '';
  mc.conNewPass = '';
  mc.showStatus = 'all';

  mc.changePass = function (invalid) {
    mc.changeDone = true;
    if(!invalid) {
      if( mc.newPass != mc.conNewPass)
        mc.changeNoMatch = true;
      else {
        mc.changeDone = false;
        httpRequest.changePass(mc.newPass)
          .then(res => {
            mc.failReset = false;;
            mc.successReset = true;
          })
          .catch(res => {
            mc.failReset = true;
          })
      }
    }


  }

  mc.unlock = function () {
    mc.lockClicked = !mc.lockClicked;
    mc.successReset = false;
    mc.changeDone = false;
    mc.newPass = '';
    mc.conNewPass = '';
  }



  if (mc.isAdmin) {

    httpRequest.getAssignedTicket()
      .then(res => {

        mc.assignedTickets = res.data.data;
        mc.adminAssignedTicket = mc.assignedTickets.length;
        mc.assignedTickets.forEach( (val, ind) => {
          if(val.status == true)
            mc.adminOpenTicket += 1;   
          val.date = timestamp.getFromId(val._id);
        })

      })
      .catch(res => {
        mc.getTicketError = true;
      })
  } else {
    httpRequest.getRaisedTicket()
      .then(res => {
        mc.raisedTickets = res.data.data.raisedTickets;
        mc.userRaisedTicket = mc.raisedTickets.length;

        mc.raisedTickets.forEach( (val, ind) => {
          if (val.status == true)
            mc.userOpenTicket += 1;
          val.date = timestamp.getFromId(val._id);  
        })
      })
      .catch(res => {
        mc.getTicketError = true;
      })
  }

  mc.viewTicket = function (id) {
    let view = '/viewTicket/'+id;
    $location.path(view);
  }
}