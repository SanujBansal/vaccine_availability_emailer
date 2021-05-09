var nodemailer = require('nodemailer');
const mailOptions = {
    from: 'Notification Service covid@notification.com', // sender address
    to: 'sanujbansal25@gmail.com', // list of receivers
    subject: '18+ available book now', // Subject line
    html: '<h1>Hello World<h1>'  // plain text body
  };

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'sanuj1770.cse16@chitkara.edu.in',
           pass: 'sk@bansal123'
       }
   });
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(info);
 });
