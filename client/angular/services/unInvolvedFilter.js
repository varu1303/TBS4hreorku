angular.module('edApp')
  .filter('unInvolvedAdmins', function() {
    return function(admins, involvedAdmins) {
      if(admins && involvedAdmins) {
        let unInvolvedList = [];
        admins.forEach( admin => {
          let inAd = false;
          involvedAdmins.forEach( inAdmin => {
            if( inAdmin.emailId == admin.emailId)
              inAd = true;
          })
          if (!inAd)
            unInvolvedList.push(admin);
        })

        return unInvolvedList;
      }
    };
  });