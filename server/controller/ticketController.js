const Ticket = require('./../mongo/schemas/ticketSchema');
const {refAssignedTicket} = require('./userController');

module.exports = {

  saveTicket: (ticketDetail, by) => {
    let ticket = new Ticket({
      ticketNo: ticketDetail.ticketNo,
      ticketTitle: ticketDetail.ticketTitle,
      ticketDescripton: ticketDetail.ticketDescripton,
      raisedBy: {
        name: by.Name,
        emailId: by.EmailId,
        phoneNumber: by.PhoneNumber
      }
    })

    return ticket.save();
  },

  getTicketCount: () => {
    return Ticket.find().count();
  },

  findTicket: tId => {
    return Ticket.findById(tId); 
  },

  findTicketByNo: tNo => {
    return Ticket.findOne({ticketNo: tNo});
  },

  changeTicketStatus: (ticket, open) => {
    ticket.status = open;
    if(open)
      ticket.rating = null;
    return ticket.save();
  },

  postComment: (ticket, comment, isAdmin, adminName, adminemailId) => {
    ticket.chat.push(comment);
    if(isAdmin) {
      let involved = false;
      ticket.involvedAdmins.forEach( (val, i) => {
        if(val.emailId == adminemailId) {
         involved = true;
        }
         
      })

      if(!involved) {
        return new Promise( (resolve,reject) => {
          refAssignedTicket(adminemailId, ticket._id)
          .then(admin => {
            ticket.involvedAdmins.push({
              name: adminName,
              emailId: adminemailId
            })
            ticket.save()
              .then(ticket => {
                resolve(ticket);
              })
              .catch(err => {
                reject(err);
              })
          })
          .catch(error => {
            reject('Could not add ticket in Admins assign ticket reference');
          })
        })
      } else {
        return ticket.save();    
      }
    } else {
      return ticket.save();
    }
  
  },

  getAll4Admin: () => {
    return Ticket.find();
  },

  involveAdmin: (admin, ticket, requestBy) => {

    return new Promise( (resolve, reject) => {

      Ticket.findById(ticket)
        .then(ticket => {
          if(!ticket) {
            reject(404);
          } else if(!ticket.status) {
            reject(422);
          } else {
            let requesterInvolved = false;
            let involved = false;
            ticket.involvedAdmins.forEach( (val, i) => {
              if(val.emailId == admin.emailId) {
                involved = true;
              }
              if(val.emailId == requestBy) {
                requesterInvolved = true;
              }    
            })
            
            if(!involved && requesterInvolved) {
              refAssignedTicket(admin.emailId, ticket._id)
              .then(admin => {
                ticket.involvedAdmins.push({
                  name: admin.name,
                  emailId: admin.emailId
                })
                ticket.save()
                  .then(ticket => {
                    resolve(admin);
                  })
                  .catch(err => {
                    reject(err);
                  })
              })
              .catch( error => {
                reject(error);
              })  
            } else if (!requesterInvolved) {
              reject(400);
            }
            else {
              resolve(admin);
            }
          }
        })
        .catch(error => {
          reject(error);
        })
    })
  },

  giveRating: (ticket, rating) => {
    ticket.rating = rating;
    return ticket.save();
  }
 
}