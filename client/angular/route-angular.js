angular.module('edApp')
  .config(function($routeProvider,$locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'templates/sign.html',
        controller: 'signController',
        controllerAs: 'Sign'
      })
      .when('/dashboard', {
        templateUrl: 'templates/dash.html',
        controller: 'dashController',
        controllerAs: 'Dash'
      })
      .when('/tickForm', {
        templateUrl: 'templates/raise.html',
        controller: 'raiseController',
        controllerAs: 'Raise'
      })
      .when('/me', {
        templateUrl: 'templates/me.html',
        controller: 'meController',
        controllerAs: 'Me'
      })
      .when('/viewTicket/:ticketId', {
        templateUrl: 'templates/ticket.html',
        controller: 'ticketController',
        controllerAs: 'Ticket'
      })
      .when('/aboutEd', {
        templateUrl: 'templates/about.html',
        controller: 'aboutController',
        controllerAs: 'About'
      })
      .when('/forgotPass', {
        templateUrl: 'templates/forgot.html',
        controller: 'forgotController',
        controllerAs: 'Forgot'
      })
      .when('/logout', {
        templateUrl: 'templates/logout.html',
        controller: 'logoutController',
        controllerAs: 'Logout'
      })
      .otherwise({
        redirectTo: '/'
      });

//To make the URLs pretty (getting rid of #)
$locationProvider.html5Mode(true);

  })

  .run(function($rootScope, $location, tokenService) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {

      $rootScope.highlight = $location.path();

      if(tokenService.isLoggedIn) {
        $rootScope.notLogged = false;
      }

      if ($location.path() !== '/' && !tokenService.isLoggedIn()) {
        if($location.path() == '/forgotPass')
          $location.path('/forgotPass')
        else if($location.path() == '/aboutEd')
          $location.path('/aboutEd')
        else {
          $rootScope.highlight = '/';
          $location.path('/');

        }
      }



      if($location.path() == '/tickForm') {
        if(tokenService.isAdmin()) {
          $rootScope.highlight = '/dashboard';
          $location.path('/dashboard');
        }
      }

      if($location.path() == '/dashboard') {
        if(!tokenService.isAdmin()) {
          $rootScope.highlight = '/tickForm';
          $location.path('/tickForm');
        }
      }

      if($location.path() == '/' && tokenService.isLoggedIn() ) {
        $rootScope.highlight = '/me';
        $location.path('/me');
      }

      if($location.path() == '/forgotPass' && tokenService.isLoggedIn() ) {
        $rootScope.highlight = '/me';
        $location.path('/me');
      }

      if($location.path() == '/aboutEd' && tokenService.isLoggedIn() ) {
        $rootScope.highlight = '/me';
        $location.path('/me');
      }

    });

  });