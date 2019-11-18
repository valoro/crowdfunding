const nodeMailer = require('nodemailer');
const config = require('../config');

/**
 *
 * @param {{to: string, subject: string, stringText: string, stringType: string}} options
 * @returns {Promise<{message: string, success: boolean, status: number}>}
 */
const sendMail = (options) => {
  const serverMail = config.mailCredentials.user;
  const serverPassword = config.mailCredentials.pass;
  const {
    to, subject, stringText, stringType,
  } = options;
  const stringTypeList = [
    'html',
    'text',
  ];
  if (!to
          || !subject
          || !stringType
          || !stringTypeList.includes(stringType.trim())
          || !stringText) {
    return { message: 'Please provide us with email, subject, type of string(html, or text), and the string', success: false, status: 400 };
  }

  const transporter = nodeMailer.createTransport({
    service: config.mailCredentials.serviceProvider,
    auth: {
      user: serverMail,
      pass: serverPassword,
    },
  });
  const mailOptions = {
    from: `CVS Website<${serverMail}>`, // sender address
    to, // list of receivers
    subject, // Subject line
  };

  mailOptions[stringType] = stringText;

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error during sending mail: ====> ', error);
        return reject({ message: error.message, success: false, status: 417 });
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
      return resolve({ message: 'Mail sent successfully', success: true, status: 200 });
    });
  })
};


module.exports = {
  sendMail,
};
