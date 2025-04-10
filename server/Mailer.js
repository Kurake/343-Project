const { PDFDocument, StandardFonts } = require('pdf-lib');
const { Buffer } = require('buffer'); 
var nodemailer = require('nodemailer');
const { isNull } = require('util');
console.log("Creating email");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sees.mailer.daemon@gmail.com',
    pass: 'glxgpcxsrmyplvjs'
  }
});

async function sendEmail({email, event, name}){
  // If name is specified, then it's a personalized certificate sent to the user
  console.log('email:', email);
  console.log('event:', event);
  console.log('name:', name);
  if(name != null){
    // INSERT PDF FILE MODIFICATION CODE IN THE FOLLOWING
    // NAME PDF USING TIMESTAMP TO MINIMIZE RACE CONDITION
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
      text: 'Hello ' + name + '.\n\nCongratulations on attending the ' + event + ' event. Attached below is your newfound certification.' +
      ' Thank you for choosing SEES, and we hope you have an EVENTful rest of the day!\n\nRegards,\nThe SEES Team',
      attachments: [
        {
            filename: 'Certificate.pdf', 
            content: pdfBuffer,
            contentType: 'application/pdf'
        }
      ]
    }
  // If no name specified, it is a mass email sent for promotional purposes.
  } else {
    var mailOptions = {
      from: 'sees.mailer.daemon@gmail.com',
      to: email,
      subject: 'Event ' + event + '',
      text: 'PLACEHOLDER TEXT FOR LATER DETERMINATION'
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

module.exports = sendEmail;