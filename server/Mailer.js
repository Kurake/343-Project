const { PDFDocument, StandardFonts } = require('pdf-lib');
const { Buffer } = require('buffer'); 
var nodemailer = require('nodemailer');
const { isNull } = require('util');
const notifier = require('./notifier');

console.log("Creating email");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sees.mailer.daemon@gmail.com',
    pass: 'glxgpcxsrmyplvjs'
  }
});

async function sendEmail({email, event, name}){
  console.log('email:', email);
  console.log('event:', event);
  console.log('name:', name);
  if(name != null){
    // INSERT PDF FILE MODIFICATION CODE IN THE FOLLOWING
    const existingPdfBytes = await fetch('http://localhost:3000/images/Certificate.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const textSize = 24
    const d = new Date()
    const dateString = d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
    // First is the name, then the event, then the date
    const nameWidth = helveticaFont.widthOfTextAtSize(name, textSize);
    const eventWidth = helveticaFont.widthOfTextAtSize(event, textSize);
    const dateWidth = helveticaFont.widthOfTextAtSize(dateString, textSize);
    const textHeight = helveticaFont.heightAtSize(textSize);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText(name, {
      x: firstPage.getWidth() / 2 - nameWidth/2,
      y: 470 + textHeight/2,
      size: textSize,
      font: helveticaFont
    })

    firstPage.drawText(event, {
      x: firstPage.getWidth() / 2 - eventWidth/2,
      y: 340 + textHeight/2,
      size: textSize,
      font: helveticaFont
    })

    firstPage.drawText(dateString, {
      x: firstPage.getWidth() / 2 - dateWidth/2,
      y: 225 + textHeight/2,
      size: textSize,
      font: helveticaFont
    })

    const pdfBytes = await pdfDoc.save()
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
    // temporary pdfbuffer generated

    var mailOptions = {
      from: 'sees.mailer.daemon@gmail.com',
      to: email,
      subject: 'Certification from event ' + event,
      text: 'Hello ' + name + '.\n\nCongratulations on attending the ' + event + ' event. Attached below is your newfound' 
      + 'certification. Thank you for choosing SEES, and we hope you have an EVENTful rest of the day!\n\nRegards,\nThe SEES Team',
      attachments: [
        {
            filename: 'Certificate.pdf', 
            content: pdfBuffer,
            contentType: 'application/pdf'
        }
      ]
    }
  }
  await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

notifier.on('message', async (data) => {
  const {email, event} = data;
  var mailOptions = {
    from: 'sees.mailer.daemon@gmail.com',
    to: email,
    subject: 'Event ' + event + '',
    text: 'Hello precious user! We have a grand new opportunity for you! An event ' + event + ' is going to occur!' +
    ' If you\'d like to find out more, log in and join us now! We hope to see you around soon, friend!\n\nRegards,' + 
    '\nThe SEES Team'
  }
  try {
    console.log(email);
    console.log(event);
    console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
})

module.exports = sendEmail;