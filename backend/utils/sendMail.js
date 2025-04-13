const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.wp.pl',
  port: 465,
  auth: {
    user: 'its101its@wp.pl',
    pass: 'iTs0987654321iTs!!',
  },
});

exports.sendEmail = async (toEmail, messageBody) => {
  const sender = {
    address: 'its101its@wp.pl',
    name: 'noreply@MeetMe.com',
  };

  const recipients = [toEmail];

  const mailOptions = {
    from: sender,
    to: recipients,
    subject: 'Welcome to MeetMe!',
    html: messageBody,
    category: 'Integration Test',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
