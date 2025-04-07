var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sees.mailer.daemon@gmail.com',
    pass: 'abcdef123456+'
  }
});

var mailOptions = {
  from: 'sees.mailer.daemon@gmail.com',
  to: 'attendee@mailservice.com',
  subject: 'Certification from event ', // Add event name to subject before mailing
  text: 'Heyo broski, sick tricks my dude', // definitely do not call them broski
  // This is just placeholder text
  attachments: [
    {
        filename: 'file-name.pdf', // Likely rewrite filename with client name and event name
        path: path.join(__dirname, '../output/file-name.pdf'), // Make sure that the pdf is stored in reachable area
        contentType: 'application/pdf'
    }
  ]
};

/*
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
*/