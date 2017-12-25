angular.module('edApp')
.controller('forgotController', forgotController);

function forgotController($rootScope, httpRequest, $timeout) {

  $rootScope.notLogged = true;
  
  const fc = this;

  fc.emailId = '';
  fc.sendStatus = '';
  fc.forgetSubmit = false;
  fc.btn_text = 'SEND';
  fc.passReqRes = false;
  fc.canLogin = false;

  fc.forgotSubmit = function (invalid) {
    fc.forgetSubmit = true;
    if(!invalid) {
      fc.btn_text = 'SENDING..';
      httpRequest.forgotPassword(fc.emailId)
        .then( res => {
          fc.btn_text = 'SUBMIT';
          fc.sendStatus = 'Check your e-mail for new password!';
          fc.passReqRes = true;
          fc.canLogin = true;

        })  
        .catch( res => {
          fc.btn_text = 'SUBMIT';
          fc.passReqRes = true;
          if (res.data.status == 404)
            fc.sendStatus = 'Email ID not registered';
          else
            fc.sendStatus = 'Error! Try Later.';


          $timeout(function () {
            fc.passReqRes = false;
          }, 3000);
        }) 
    }
  }
}