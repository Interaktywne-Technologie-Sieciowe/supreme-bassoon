const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.wp.pl',
  port: 465,
  auth: {
    user: 'its101its@wp.pl',
    pass: 'iTs0987654321iTs!',
  },
});

exports.sendTestEmail = async (toEmail) => {
  const sender = {
    address: 'its101its@wp.pl',
    name: 'ITS mail Test',
  };

  const recipients = [toEmail];

  const mailOptions = {
    from: sender,
    to: recipients,
    subject: 'EMAIL TESTOWY!',
    text: 'To jest email testowy, nie ma tu czego szukać :p',
    category: 'Integration Test',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
