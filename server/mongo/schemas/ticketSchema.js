const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  ticketNo: {
    type: String,
    required: true,
    unique: true
  },
  ticketTitle: {
    type: String,
    required: true
  },
  ticketDescripton: {
    type: String,
    required: true
  },
  raisedBy: {
    name: String,
    emailId: String,
    phoneNumber: String
  },
  status: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  involvedAdmins: [{
    name: String,
    emailId: String
  }],
  chat: [{
    text: String,
    by: String
  }]
})


module.exports = mongoose.model('Ticket', ticketSchema);