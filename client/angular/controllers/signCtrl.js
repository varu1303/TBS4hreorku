angular.module('edApp')
  .controller('signController', signController);

function signController(httpRequest, tokenService, $location, $rootScope, $timeout) {

  $rootScope.notLogged = true;


  const sc = this;
  sc.subDone = false;

  function init () {
    sc.logId = '';
    sc.logPass = '';
  
    sc.upId = '';
    sc.upPass = '';
    sc.upConPass = '';
    sc.upNumber = '';
    sc.upName = '';
    sc.regDone = false;
    sc.regNoMatch = false;
    sc.notValidPhone = false;
    sc.EmailorPhoneTaken = false;
    sc.regSuccess = false;
    sc.logbtn_text = 'LOGIN';
    sc.regbtn_text = 'REGISTER';

  }

  let resetLoginErrors = function () {
    sc.login_emailNotFound = false;
    sc.login_incorrectPassword = false;
    sc.login_serverError = false;
  }

  init();
  resetLoginErrors();



  sc.active = "login";
  sc.tab = function (tabName) {
    sc.active = tabName;
  }

  sc.logSubmit = function(logFormInvalid) {
    sc.subDone = true;

    if (!logFormInvalid) {
      sc.logbtn_text = 'LOGGING IN...';
      let userCredentials = {};
      userCredentials.emailId = sc.logId;
      userCredentials.password = sc.logPass;

      httpRequest.toLogin(userCredentials)
      .then(res => {

        resetLoginErrors();
        
        let token = res.data.data.token;
        tokenService.saveToken(token);
        $rootScope.isAdmin = tokenService.isAdmin();
        $location.path('/me');
        // angular.element('.stretch').triggerHandler('click');

      })
      .catch(res => {
        resetLoginErrors();

        if(res.data.status == 404)
          sc.login_emailNotFound = true;
        else if(res.data.status == 400)
          sc.login_incorrectPassword = true;
        else 
          sc.login_serverError = true;

        sc.logbtn_text = 'LOGIN';

      })
    }
  }

  sc.regSubmit = function(regFormInvlaid) {
    sc.regDone = true;
    sc.regNoMatch = false;
    sc.notValidPhone = false;
    sc.EmailorPhoneTaken = false;

    if ( sc.upPass != sc.upConPass )
      sc.regNoMatch = true;
    else if (!regFormInvlaid) {
      sc.regbtn_text = 'REGISTERING...';
      let userDetails = {};
      userDetails.name = sc.upName;
      userDetails.emailId = sc.upId;
      userDetails.password = sc.upPass;
      userDetails.phoneNumber = sc.upNumber;

      httpRequest.toRegister(userDetails)
        .then(res => {
          init();
          sc.regSuccess = true;

          $timeout( function () {
            sc.regSuccess = false
          }, 5000);
        })
        .catch(res => {
          sc.regDone = false;
          sc.regbtn_text = 'REGISTER';
          if (res.data.error['userDetails.phoneNumber'])
            sc.notValidPhone = true; 
          
          if(res.data.status == 400)
            sc.EmailorPhoneTaken = true;
        })
    }
  }
}