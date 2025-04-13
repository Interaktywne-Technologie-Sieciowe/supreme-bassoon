const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.wp.pl',
  port: 465,
  auth: {
    user: 'its101its@wp.pl',
    pass: 'iTs0987654321iTs!!',
  },
});

exports.sendEmail = async (toEmail, password) => {
  const sender = {
    address: 'its101its@wp.pl',
    name: 'noreplay@MeetMe.com',
  };

  const recipients = [toEmail];

  const mailOptions = {
    from: sender,
    to: recipients,
    subject: 'Welcome to MeetMe!',
    text: 'Welcome to MeetMe! Your temporar password is:\n\n'+password+'\n\n Please change it as soon as possible.',
    category: 'Integration Test',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
