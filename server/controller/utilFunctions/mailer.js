const nodemailer = require('nodemailer');
//
const {emailId, password} = require('./../../config/email-cred');

let transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  auth: {
      user: emailId, // Your email id
      pass: password // Your password
  }
});

module.exports = {
  
  sendPassMail: (email, newpass) => {
  
    return new Promise((resolve, reject) => {
        let text = `Hey! Your new PASSWORD is : ${newpass}. You can change your password from your home page (unlock symbol)!` 
        let mailOptions = {
                from: emailId, // sender address
                to: email, // list of receivers
                subject: 'Password Change', // Subject line
                text: text 
            };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                reject();

            }else{
                resolve({
                    email,
                    pass: newpass
                });
            }
        }); 
        
    });


  },

  statusUpdateMail: (t, open, by, byEmail) => {
    let text;
    let action;
    let to = [];

    if (open) {
      text = `${t.ticketNo} re-opened by ${by}`;
      action = 'REOPENED';
    } else {
      text = `${t.ticketNo} closed by ${by}`;
      action = 'CLOSED';
    }

    if (byEmail == t.raisedBy.emailId) {
      t.involvedAdmins.forEach( (val, i) => {
        to.push(val.emailId);
      })
    } else {
      to.push(t.raisedBy.emailId)
      t.involvedAdmins.forEach( (val, i) => {
        if(val.emailId != byEmail)
          to.push(val.emailId);
      })      
    }

    if (to.length) {
      let mailOptions = {
        from: emailId, // sender address
        to: to, // list of receivers
        subject: `${t.ticketNo} : ${action}`, // Subject line
        text: text 
      };
  
      transporter.sendMail(mailOptions);
    }

  },

  commentMail: (t, by, byEmail) => {

    let text = `A new comment on ${t.ticketNo} by ${by}`;
    let to = [];

    if (byEmail == t.raisedBy.emailId) {
      t.involvedAdmins.forEach( (val, i) => {
        to.push(val.emailId);
      })
    } else {
      to.push(t.raisedBy.emailId)
      t.involvedAdmins.forEach( (val, i) => {
        if(val.emailId != byEmail)
          to.push(val.emailId);
      })      
    }

    if(to.length) {
      let mailOptions = {
        from: emailId, // sender address
        to: to, // list of receivers
        subject: `${t.ticketNo} : got a response.`, // Subject line
        text: text 
      };
  
      transporter.sendMail(mailOptions); 
    }

   
  },

  assignedMail: (tNo, to, by, byEmail) => {

    let text = `A new ticket has been assigned to you : ${tNo} by ${by} - ${byEmail}`;


    let mailOptions = {
      from: emailId, // sender address
      to: to, // list of receivers
      subject: `${tNo} : ASSIGNED`, // Subject line
      text: text 
    };

    transporter.sendMail(mailOptions);    
  }

}