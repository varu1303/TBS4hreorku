angular.module('edApp')
.filter('status', function() {
  return function(tickets, stat) {
    if(!tickets)
      return [];
    else {
      if(stat == 'all')
        return tickets;
      else {
        let returnTick = [];
        if(stat == 'open') {
          tickets.forEach( val => {
            if(val.status)
              returnTick.push(val);
          })
        } else if(stat == 'close') {
          tickets.forEach( val => {
            if(!val.status)
              returnTick.push(val);
          })   
        }

        return returnTick;
      }
    }
      
  };
});