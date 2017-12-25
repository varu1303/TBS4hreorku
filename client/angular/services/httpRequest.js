angular.module('edApp')
  .service('httpRequest', httpRequest);


function httpRequest($http, tokenService) {
  
  this.toRegister = function (userDetails) {
    return $http.post('/signup', { userDetails });    
  }

  this.toLogin = function (userCredentials) {
    return $http.post('/login', { userCredentials })
  }

  this.forgotPassword = function (emailId) {
    return $http.post('/forgotpassword', { emailId })
  }

  this.getAssignedTicket = function () {
    return $http.get('/admin/assignedTickets',{
        headers: {'x-auth' : tokenService.getToken()
      }
    });  
  }

  this.getRaisedTicket = function () {
    return $http.get('/allTicketRaised',{
      headers: {'x-auth' : tokenService.getToken()
      }
    });
  }

  this.viewUsersTicket = function (id) {
    return $http.get('/ticket/'+id, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }

  this.viewAdminsTicket = function (id) {
    return $http.get('/admin/ticket/'+id, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }

  this.changePass = function (newPassword) {
    return $http.post('/changePassword', { newPassword }, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }

  this.raiseTicket = function (ticketDetail) {
    return $http.post('/raiseTicket', { ticketDetail }, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }

  this.allTickets = function () {
    return $http.get('admin/allTickets', {
      headers: {'x-auth' : tokenService.getToken()
      }
    })
  }

  this.addComment = function (tId, text) {
    return $http.put('/ticketComment/'+tId, { text },  {
      headers: {'x-auth' : tokenService.getToken()
      }
    })
  }

  this.getUpdatedChat = function (tId) {
    return $http.get('/ticketComment/'+ tId, {
      headers: {'x-auth' : tokenService.getToken()
      }
    })
  }

  this.closeTicket = function (tId) {
    return $http.put('/ticketStatus/'+ tId, { status: false}, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }

  this.reopenTicket = function (tId) {
    return $http.put('/ticketStatus/'+ tId, { status: true}, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })    
  }

  this.rateTicket = function (tId, rating) {
    return $http.put('/ticketRating/'+ tId,  { rating }, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }

  this.getAdmins = function () {
    return $http.get('alladmin', {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }

  this.invloveAdmin = function (emailId, ticket) {
    return $http.post('admin/involve', { emailId, ticket}, {
      headers: {'x-auth' : tokenService.getToken()
      }    
    })
  }
}