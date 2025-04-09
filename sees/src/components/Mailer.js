import { text } from 'express';
import { PDFDocument, StandardFonts } from 'pdf-lib'
var nodemailer = require('nodemailer');
const fs = require('fs');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sees.mailer.daemon@gmail.com',
    pass: 'abcdef123456+'
  }
});

async function sendEmail(email, event, recipientName){
  // If name is specified, then it's a personalized certificate sent to the user
  if(recipientName != ""){
    // INSERT PDF FILE MODIFICATION CODE IN THE FOLLOWING
    // NAME PDF USING TIMESTAMP TO MINIMIZE RACE CONDITION
    const existingPdfBytes = fs.readFileSync('./Certificate.pdf');
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const newName =  Date.now + recipientName + '.pdf';
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const textSize = 24
    const dateString = Date.getDate() + '/' + Date.getMonth + '/' + Date.getFullYear();
    // First is the name, then the event, then the date
    const nameWidth = helveticaFont.widthOfTextAtSize(recipientName, textSize);
    const eventWidth = helveticaFont.widthOfTextAtSize(event, textSize);
    const dateWidth = helveticaFont.widthOfTextAtSize(dateString, textSize);
    const textHeight = helveticaFont.heightAtSize(textSize);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText(recipientName, {
      x: firstPage.getWidth() / 2 - nameWidth/2,
      y: 425 - textHeight/2,
      size: textSize,
      font: helveticaFont
    })

    firstPage.drawText(event, {
      x: firstPage.getWidth() / 2 - eventWidth/2,
      y: 568 - textHeight/2,
      size: textSize,
      font: helveticaFont
    })

    firstPage.drawText(event, {
      x: firstPage.getWidth() / 2 - dateWidth/2,
      y: 705 - textHeight/2,
      size: textSize,
      font: helveticaFont
    })

    const pdfBytes = await pdfDoc.save()
    const outputPath = './' + newName;
    fs.writeFileSync(outputPath, pdfBytes);
    // Pdf now saved to output path.

    var mailOptions = {
      from: 'sees.mailer.daemon@gmail.com',
      to: email,
      subject: 'Certification from event ' + event,
      text: 'Hello ' + recipientName + '.\n\nCongratulations on attending the ' + event + ' event. Attached below is your newfound certification.' +
      ' Thank you for choosing SEES, and we hope you have an EVENTful rest of the day!\n\nRegards,\nThe SEES Team',
      attachments: [
        {
            filename: newName, 
            path: path.join(__dirname, './components/' + newName),
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
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  // NOW BE SURE TO DELETE THE GENERATED PDF IF THERE IS ONE
  if(recipientName != ""){
    deleteFile(outputPath);
  }
}

function deleteFile(filePath){
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.log("Error", err);
  }
}