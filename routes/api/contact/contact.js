var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const creds = require('../../../config/contactEmail');

var transport = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      type: 'oauth2',
      user: creds.USER,
      clientId: creds.CID,
      clientSecret: creds.CIS,
      refreshToken: creds.RST,
      accessToken: creds.ATK,
  }
}

var transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take messages');
  }
});

router.post("/contact", (req, res, next) => {
  var firstname = req.body.firstname
  var familyname = req.body.familyname
  var email = req.body.email
  var phone = req.body.phone 
  var title = req.body.title 
  var message = req.body.message
  var content = `firstname: ${firstname} \n familyname: ${familyname} \n email: ${email} \n phone: ${phone} \n message: ${message}`

  var mail = {
    from: firstname,
    to: "exploreprograming@gmail.com",  //Change to email address that you want to receive messages on
    subject: `[ContactUs Message]: ${title}`,
    text: content,   
  }

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        msg: 'fail'
      })
    } else {
      res.json({
        msg: 'success'
      })
    }
  })
})

module.exports = router;
