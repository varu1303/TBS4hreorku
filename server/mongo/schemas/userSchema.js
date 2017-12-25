const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//
const Ticket = require('./ticketSchema');
//

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  assignedTickets: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Ticket' 
  }],
  raisedTickets: [{
    type: Schema.Types.ObjectId, 
    ref: 'Ticket'    
  }] 
});


// Sending back publicfields on success
userSchema.methods.getPublicFields = function () {
  return {
    name: this.name,
    emailId: this.emailId,
  }
};

// Sending payload data
userSchema.methods.getPayload = function () {
  let payload = {
      name: this.name,
      emailId: this.emailId,
      phoneNumber: this.phoneNumber,
      admin: this.admin,
  };
  return payload;
};


module.exports = mongoose.model('User', userSchema);