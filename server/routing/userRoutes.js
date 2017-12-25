const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');
//
const {responseObj} = require('./../config/response');
const {prodUser} = require('./../config/adminRightsTo');
//Controller functions
const {saveUser, loginUser, updPassword, refRaisedTicket, getRaisedTicket} = require('./../controller/userController');
const {saveTicket, findTicket, changeTicketStatus, postComment, getTicketCount, giveRating} = require('./../controller/ticketController');
const {generateJWT} = require('./../controller/utilFunctions/jwt');
const createNewPassword = require('./../controller/utilFunctions/randomString');
const {sendPassMail, statusUpdateMail, commentMail} = require('./../controller/utilFunctions/mailer');
//Middlewares
const {isLoggedIn} = require('./middleware/isLoggedIn');
const {createHash, createHashFunction} = require('./middleware/hashPass');

module.exports = app => {

// USER can 1) SIGNUP 
//          2) LOGIN 
//          3) FORGET PASSWORD
    /**(4 to 9)below mentioned routes only works if user is logged in (A valid JWT required to be passed in header)**/
//          4) CHANGE PASSWORD
//          5) RAISE TICKET
    /**(6-7)Tickets are searched in user's Collection - reference document raisedTickets in user doc **/
//          6) GET ALL TICKETS RAISED BY A USER
//          7) GET ALL DETAILS OF ANY ONE PARTICULAR TICKET RAISED BY A USER
    /**(8-9) Ticket picked from Ticket's collection only if 'raisedby' matches with the token's data or an Admin**/
//          8) OPEN/CLOSE THAT TICKET
//          9) POST COMMENT ON THAT TICKET
//         10) REFRESH COMMENTS (GET COMMENTS)
//         11) RATE EXPERIENCE FOR A TICKET
         
        

  app.post('/signup',  [
    check('userDetails.emailId')
      .isEmail().withMessage('must be an email')
      .trim(),
  
    check('userDetails.password', 'passwords must be 6 to 10 chars long')
      .isLength({ min: 6, max: 10 })
      .trim(),
    
    check('userDetails.phoneNumber', 'Phone number must be a valid Indian Mobile Number')
      .isMobilePhone("en-IN"),

    check('userDetails.name').exists()

  ], createHash, (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(responseObj(errors.mapped(), 'SERVER VALIDATION FAILED', 422, null));
    } else {
      let userDetails = req.body.userDetails;
      userDetails.password = req.hash;

      userDetails.emailId = userDetails.emailId.toLowerCase();
      let emailDomain = userDetails.emailId.split("@")[1];
      if(emailDomain == prodUser)
        userDetails.admin = true;
      else
        userDetails.admin = false;
      
      saveUser(userDetails)
        .then((user) => {
          res.json(responseObj(null,'Sign up successful',200,user.getPublicFields()));
        })
        .catch((error) => {
          res.status(400).json(responseObj(error,'Sign up failed',400,null));
        })
    }

  })

  app.post('/login', (req,res) => {
    let userCredentials = req.body.userCredentials;
    userCredentials.emailId = userCredentials.emailId.toLowerCase();
    if(!userCredentials.emailId)
      res.status(400).json(responseObj(null,'Email ID not provided',400,null));
    else {
      loginUser(userCredentials.emailId)
        .then((user) => {
          if(!user)
            res.status(404).json(responseObj(null,'Email ID not found in the Database',404,null));
          else {
            if(!userCredentials.password)
              res.status(400).json(responseObj(null,'Password not provided',400,null));
            else {
              bcrypt.compare(userCredentials.password, user.password, function(err, match) {
                if(err) {
                  res.status(500).json(responseObj(err,'Error in decrypting Password',500,null));
                } else if(match) {
                    let token = generateJWT(user.getPayload());
                    let data = user.getPublicFields();
                    data.token = token;
                    res.json(responseObj(null,'Login Successful',200,data));
                } else {
                    res.status(400).json(responseObj(null,'Incorrect Password',400,null));  
                }
              })              
            }
          }
        })
        .catch((error) => {
          res.status(500).json(responseObj(error,'Error in Finding user in DB',500,null));
        })
      }
  })

  app.post('/forgotpassword', (req, res) => {
    let emailId = req.body.emailId;
    if(!emailId)
      res.status(400).json(responseObj(null,'Email ID not provided',400,null)); 
    else {
      loginUser(emailId)
        .then((user) => {
          if(!user)
            res.status(404).json(responseObj(null,'Email ID not found in the Database',404,null));
          else {
            sendPassMail(emailId,createNewPassword())
              .then((updateDetails) => {
                updateDetails.pass = createHashFunction(updateDetails.pass);
                return updPassword(updateDetails);                
              })
              .then((user) => {
                res.json(responseObj(null,'New password set and sent',200,user.getPublicFields()));    
              })
              .catch((error) => {
                res.status(500).json(responseObj(error,'Error in Setting and sending new password',500,null));
              })
          }
        })
        .catch((error) => {
          res.status(500).json(responseObj(error,'Error in Finding user in DB',500,null));
        })      
    }
  })

  app.post('/changePassword', isLoggedIn, (req, res) => {
    if(!req.body.newPassword)
      res.status(400).json(responseObj(null,'New password not provided',400,null));  
    else {
      let u = {};
      u.email = req.emailidFROMTOKEN;
      u.pass = createHashFunction(req.body.newPassword);

      updPassword(u)
      .then((user) => {
        res.json(responseObj(null,'Password changed',200,user.getPublicFields()));     
      })
      .catch((error) => {
        res.status(500).json(responseObj(error,'Error in changing password',500,null));        
      })
  
      }
    })
    
    app.post('/raiseTicket', isLoggedIn, (req, res) => {
      if(req.isAdminFROMTOKEN) {
        res.status(400).json(responseObj(null,'Admins cannot raise ticket',400,null));
      } else {
        let ticketDetail = req.body.ticketDetail;
        let n= getTicketCount()
        .then(c => {
          let n = Math.ceil(Math.random()* 100);
          ticketDetail.ticketNo = 'Tick00'+ n;
          ticketDetail.ticketNo += c;
          let by = {};
          by.Name = req.nameFROMTOKEN;
          by.EmailId = req.emailidFROMTOKEN;
          by.PhoneNumber = req.phonenumberFROMTOKEN;
          saveTicket(ticketDetail, by)
            .then((ticket) => {
              return refRaisedTicket(ticket.raisedBy.emailId, ticket._id); 
            })
            .then((user) => {
              res.json(responseObj(null,'Ticket saved and referenced',200,user.getPublicFields()))
            })
            .catch((error) => {
              res.status(500).json(responseObj(error,'Error in saving Ticket',500,null));
            })
        })
        .catch(err => {
          res.status(500).json(responseObj(err,'Error in generating Ticket number',500,null));
        })
        
      }

    })

    app.get('/allTicketRaised', isLoggedIn, (req, res) => {
      getRaisedTicket(req.emailidFROMTOKEN)
        .then((user) => {
          data = user.getPublicFields();
          data.raisedTickets = user.raisedTickets;
          res.json(responseObj(null,'Got all the tickets raised by me',200,data));
        })
        .catch((error) => {
          res.status(500).json(responseObj(error,'error in getting raised tickets',500,null));
        })
    })

    app.get('/ticket/:ticketid', isLoggedIn, (req, res) => {
      let ticketId = req.params.ticketid;
      let i = -1;
      getRaisedTicket(req.emailidFROMTOKEN)
      .then((user) => {
        data = user.raisedTickets;
        data.forEach((val, ind) => {
          if(val._id == ticketId) {
            i = ind;
            return;
          }
        })
        if(i == -1) {
          res.status(404).json(responseObj(null,'Ticket not found',404,null));
        } else {
          res.json(responseObj(null,'Got the ticket',200,data[i]));
        }
      })
      .catch((error) => {
        res.status(500).json(responseObj(error,'error in getting raised ticket',500,null));
      })           
    })

    app.put('/ticketStatus/:ticketId', isLoggedIn, (req, res) => {
      let tId = req.params.ticketId;
      let open = req.body.status;
      findTicket(tId)
        .then(ticket => {
          if(!ticket) {
            return 404;
          } else {
            if(open && ticket.status) {
              return 422;
            } else {
              if(ticket.raisedBy.emailId == req.emailidFROMTOKEN || req.isAdminFROMTOKEN ) {  
                return changeTicketStatus(ticket, open);
              } else {
                return 401;    
              }
            }
          }
        })
        .then(ticket => {
          if(ticket == 404)
            res.status(404).json(responseObj(null, 'Ticket not present in DB', 404, null))
          else if(ticket == 422) 
            res.status(422).json(responseObj('Already open, cannot open again', 'Ticket not opened', 422, null));
          else if(ticket == 401)
            res.status(401).json(responseObj(null,'Not authorised to change status either has to be owner of that ticket or an involved Admin',401,null));
          else {
            res.json(responseObj(null, 'Updated ticket status', 200, ticket));
            statusUpdateMail(ticket, open, req.nameFROMTOKEN, req.emailidFROMTOKEN);
          }
        })
        .catch((error) => {
          res.status(500).json(responseObj(error,'error in getting the ticket',500,null));
        })
           
    })

    app.put('/ticketComment/:ticketId', isLoggedIn, (req, res) => {
      let tId = req.params.ticketId;
      let comment = {};
      comment.text = req.body.text;
      comment.by = req.nameFROMTOKEN;
      findTicket(tId)
        .then(ticket => {
          if(!ticket) {
            return 404;
          } else {
            if (!ticket.status) {
              return(422);
            } else if(ticket.raisedBy.emailId == req.emailidFROMTOKEN || req.isAdminFROMTOKEN) {
              return postComment(ticket, comment, req.isAdminFROMTOKEN, req.nameFROMTOKEN, req.emailidFROMTOKEN);
            } else {
              return 401;
            }
          }
        })
        .then(ticket => {
          if (ticket == 422) 
            res.status(422).json(responseObj(null, 'Ticket is closed cannot add comments', 422, null));
          else if(ticket == 404)
            res.status(404).json(responseObj(null, 'Ticket not present in DB', 404, null));
          else if(ticket == 401)
            res.status(401).json(responseObj(null,'Not authorised to add comment either has to be owner of that ticket or an Admin',401,null));    
          else {
            res.json(responseObj(null, 'Added comment', 200, ticket));
            commentMail(ticket, req.nameFROMTOKEN, req.emailidFROMTOKEN);
          }
        })
        .catch((error) => {
          res.status(500).json(responseObj(error,'error in adding comment',500,null));
        })
           
    })

    app.get('/ticketComment/:ticketId', isLoggedIn, (req, res) => {
      let tId = req.params.ticketId;
    
      findTicket(tId)
        .then(ticket => {
          if(!ticket) {
            res.status(404).json(responseObj(null, 'Ticket not found', 404, null));
          } else if( ticket.raisedBy.emailId != req.emailidFROMTOKEN && !req.isAdminFROMTOKEN) {
            res.status(401).json(responseObj(null, 'Not authorised to get comments for this ticket', 401, null));
          } else {
            res.json(responseObj(null, 'Updated comments of this ticket', 200, ticket.chat));
          }
        })
        .catch((error) => {
          res.status(500).json(responseObj(error,'error in getting comment',500,null));
        })

    })

    app.put('/ticketRating/:ticketId', isLoggedIn, (req, res) => {
      let tId = req.params.ticketId;
      let rating = Number(req.body.rating);

      findTicket(tId)
        .then(ticket => {
          if(!ticket) {
            return 404;
          } else {
            if (ticket.status) {
              return(422);
            } else if(ticket.raisedBy.emailId == req.emailidFROMTOKEN) {
              return giveRating(ticket, rating);
            } else {
              return 401;
            }
          }
        })
        .then(ticket => {
          if (ticket == 422) 
            res.status(422).json(responseObj(null, 'Ticket is open rating not processed', 422, null));
          else if(ticket == 404)
            res.status(404).json(responseObj(null, 'Ticket not present in DB', 404, null));
          else if(ticket == 401)
            res.status(401).json(responseObj(null, 'Not authorised to give rating to this ticket- only owner can', 401, null));    
          else {
            res.json(responseObj(null, 'Added rating', 200, ticket));
            // commentMail(ticket, req.nameFROMTOKEN, req.emailidFROMTOKEN);
          }
        })
        .catch((error) => {
          res.status(500).json(responseObj(error, 'error in giving rating', 500, null));
        })

    })


}
