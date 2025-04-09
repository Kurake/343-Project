var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sees.mailer.daemon@gmail.com',
    pass: 'abcdef123456+'
  }
});

function sendEmail(email, event, recipientName){
  // If name is specified, then it's a personalized certificate sent to the user
  if(recipientName != ""){
    var mailOptions = {
      from: 'sees.mailer.daemon@gmail.com',
      to: email,
      subject: 'Certification from event ' + event,
      text: 'Hello ' + recipientName + '.\n\nCongratulations on attending the ' + event + ' event. Attached below is your newfound certification.' +
      ' Thank you for choosing SEES, and we hope you have an EVENTful rest of the day!\n\nRegards,\nThe SEES Team',
      attachments: [
        {
            filename: pdfFilename, 
            path: path.join(__dirname, '../output/file-name.pdf'), // Make sure that the pdf is stored in reachable area
            contentType: 'application/pdf'
        }
      ]
    }
  // Otherwise, it is a mass email sent for promotional purposes.
  } else {
    var mailOptions = {
      from: 'sees.mailer.daemon@gmail.com',
      to: email,
      subject: 'Event ' + event + '',
      text: 'Heyo broski, sick tricks my dude'
    }
  }
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}