const {responseObj} = require('./../config/response');
//Controller
const {getAll4Admin, findTicket, involveAdmin, findTicketByNo} = require('./../controller/ticketController');
const {getAssigned2Admin, loginUser, findAdmins} = require('./../controller/userController');
const {assignedMail} = require('./../controller/utilFunctions/mailer');
//Middlewares
const {isLoggedIn} = require('./middleware/isLoggedIn');
const isAdmin = require('./middleware/isAdmin');


module.exports = app => {

//ADMIN can 1) GET ALL THE TICKETS RAISED 
//          2) GET ALL THE ASSIGNED TICKETS FOR LOGGED IN ADMIN
//          3) OPEN ANY PARTICULAR TICKET TO VIEW DETAILS
//        4-5 already covered in User's routes!
//          4) CHANGE STATUS OF ANY PARTICULAR TICKET
//          5) ADD COMMENT TO A TICKET
//          6) SHOULD BE ABLE TO INVOLVE SOME OTHER ADMIN IN A TICKET FOR ASSISTANCE
//          7) ADMIN CANNOT 'CHANGE STATUS' or 'INVOVLE OTHER ADMIN' without BEING in involvedAdmin list
// **(COMMENT adds an ADMIN to involvedAdmin list || someother adimn who is already involved can also add an admin)
//          8) FIND TICKET BY TICKET NUMBER
//          9) GETTING ALL THE ADMINS IN THE SYSTEM

  app.get('/admin/allTickets', isLoggedIn, isAdmin, (req, res) => {
    getAll4Admin()
      .then(tickets => {
        res.json(responseObj(null, 'All the tickets in system', 200, tickets));
      })
      .catch(error => {
        res.status(500).json(responseObj(error, 'Error in getting tickets', 500, null));
      })
  })

  app.get('/admin/assignedTickets', isLoggedIn, isAdmin, (req, res) => {
    getAssigned2Admin(req.emailidFROMTOKEN)
      .then(user => {
        res.json(responseObj(null, 'All the tickets assigned', 200, user.assignedTickets));
      })
      .catch(error => {
        res.status(500).json(responseObj(error, 'Error in getting assigned tickets', 500, null));
      })
  })

  app.get('/admin/ticket/:ticketId', isLoggedIn, isAdmin, (req, res) => {
    let tId = req.params.ticketId;
    findTicket(tId)
      .then(ticket => {
        if(!ticket)
          res.status(404).json(responseObj(null, 'Ticket not found in DB', 404, null));
        else
          res.json(responseObj(null, 'Ticket found', 200, ticket));
      })
      .catch(error => {
        res.status(500).json(responseObj(error, 'Error in getting tickets', 500, null));
      })
  })

  app.post('/admin/involve', isLoggedIn, isAdmin, (req, res) => {

    let involveAdminEmailId = req.body.emailId;
    let ticketId = req.body.ticket.ticketId;
    let ticketNo = req.body.ticket.ticketNo;
    loginUser(involveAdminEmailId)
      .then(user => {
        if(!user) {
          res.status(404).json(responseObj(null, 'Admin not in DB', 404, null));
        } else if(!user.admin) {
          res.status(400).json(responseObj(null, 'Cant be involved. Not an Admin!', 400, null));
        } else {
          involveAdmin(user, ticketId, req.emailidFROMTOKEN)
            .then(admin => {
              res.json(responseObj(null, 'Admin involved', 200, admin.getPublicFields()));
              assignedMail(ticketNo, involveAdminEmailId, req.nameFROMTOKEN, req.emailidFROMTOKEN);
            })
            .catch(error => {
              if(error == 404)
                res.status(404).json(responseObj('Ticket not found in DB', 'Admin could not be invloved', 500, null));
              else if(error == 422)
                res.status(422).json(responseObj('Ticket already closed cannot involve anyone', 'Admin could not be invloved', 422, null));
              else if (error == 400)
                res.status(400).json(responseObj('Reqester not involved in the ticket so cannot ask for assistance', 'Admin could not be invloved', 500, null));
              else
                res.status(500).json(responseObj(error, 'Admin could not be invloved', 500, null));
              
            })
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).json(responseObj(error, 'Error in looking up Admin in DB', 500, null));
      })

  })

  app.get('/admin/ticketNo/:ticketNo', isLoggedIn, isAdmin, (req, res) => {
    let tNo = req.params.ticketNo;
    findTicketByNo(tNo)
      .then(ticket => {
        if(!ticket)
          res.status(404).json(responseObj(null, 'Ticket not found in DB', 404, null));
        else
          res.json(responseObj(null, 'Ticket found', 200, ticket));
      })
      .catch(error => {
        res.status(500).json(responseObj(error, 'Error in getting tickets', 500, null));
      })
  })

  app.get('/alladmin', isLoggedIn, isAdmin, (req,res) => {

    findAdmins()
      .then( admins => {
        
        let a = admins.filter( (val, ind) => {
          return (val.emailId != req.emailidFROMTOKEN);
        })
        if(a.length == 0)
          res.json(responseObj(null, 'No other admins found except for requester', 404, null));
        else
          res.json(responseObj(null, 'Array of all admins', 200, a));
      })
      .catch(error => {
        res.status(500).json(responseObj(error, 'Error in getting admins', 500, null));
      })
  })


}
