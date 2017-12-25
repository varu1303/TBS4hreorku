angular.module('edApp')
  .service('timestamp', timestamp);

function timestamp () {

  this.getFromId = function (_id) {
    let timestamp = _id.toString().substring(0,8);
    return new Date( parseInt( timestamp, 16 ) * 1000 );
  }

}
