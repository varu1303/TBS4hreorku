const ObjectId = require('mongodb').ObjectID;
const User = require('./../mongo/schemas/userSchema');

module.exports = {

  saveUser: u => {
    let user = new User({
      name: u.name,
      emailId: u.emailId,
      phoneNumber: u.phoneNumber,
      password: u.password,
      admin: u.admin
    })

    return user.save();
  },

  loginUser: email => {
    return User.findOne({emailId: email});
  },

  updPassword: updateDetails => {
    return (new Promise((resolve, reject) => {
      User.findOne({emailId: updateDetails.email})
        .then((user) => {
          if(!user)
            throw new Error("Email ID not found in DB");
          else {
            user.password = updateDetails.pass;
            return user.save();
          }
        })
        .then((finuser) => {
          resolve(finuser);
        })
        .catch((err) => {
          reject(err);
        })
    })
    )},

    refRaisedTicket: (emailId,ticketId) => {
      return new Promise((resolve, reject) => {
        User.findOne({emailId: emailId})
          .then((user) => {
            t = ObjectId(ticketId);
            user.raisedTickets.push(t);
            return user.save();
          })
          .then((updatedUser) => {
            resolve(updatedUser);
          })
          .catch((error) => {
            reject(error);
          })
      })
    },

    getRaisedTicket: emailId => {
      return User.findOne({emailId: emailId})
              .populate('raisedTickets');
    },

    getAssigned2Admin: emailId => {
      return User.findOne({emailId: emailId})
              .populate('assignedTickets');
    },

    refAssignedTicket: (emailId, ticketId) => {
      return new Promise((resolve, reject) => {
        User.findOne({emailId: emailId})
          .then((user) => {
            t = ObjectId(ticketId);
            user.assignedTickets.push(t);
            return user.save();
          })
          .then((updatedUser) => {
            resolve(updatedUser);
          })
          .catch((error) => {
            reject(error);
          })
      })      
    },

    findAdmins: () => {
      return User.find({ admin: true }).select({ "name": 1, "emailId": 1});
    }



}