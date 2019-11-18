const { Individual, Organization } = require('../services');
const config = require('../config');
const Client = require('twilio')(config.twilioCredentials.accountSid, config.twilioCredentials.authToken);
const { sendMail } = require('../services/mailer');
const jwt = require('jsonwebtoken');
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const eventEmitter = new MyEmitter();

eventEmitter.on('individual_register', async user => {
    try {
        const service = await Client.verify.services.create({friendlyName: 'Verify Service'});
        await Client.verify.services(service.sid).verifications.create({to: user.mobile, channel: 'sms'});
        let newUser = await Individual.updateUser(user._id, {
            oneTimePasswordCreatedAt: Date.now(),
            oneTimePasswordExpiresAt: (Date.now() + (15 * 60 * 1000)),
            oneTimePasswordSid: service.sid
        });
        console.log(`- Sent One Time Password to User: ${user._id} Successfly. Expires at: ${newUser.oneTimePasswordExpiresAt}`);
    } catch (error) {
        console.log(`- Error Sending One Time Password to User: ${user._id}`);
    }
});

eventEmitter.on('organization_register', async user => {
    try {
        const service = await Client.verify.services.create({friendlyName: 'Verify Service'});
        await Client.verify.services(service.sid).verifications.create({to: user.mobile, channel: 'sms'});
        let newUser = await Organization.updateUser(user._id, {
            oneTimePasswordCreatedAt: Date.now(),
            oneTimePasswordExpiresAt: (Date.now() + (15 * 60 * 1000)),
            oneTimePasswordSid: service.sid
        });
        console.log(`- Sent One Time Password to User: ${user._id} Successfly. Expires at: ${newUser.oneTimePasswordExpiresAt}`);
    } catch (error) {
        console.log(`- Error Sending One Time Password to User: ${user._id}`);
    }
});

eventEmitter.on('reset_email', async user => {
    let tokenUrl = jwt.sign(user, config.jwtSecret);
    const {message, success, status} = await sendMail({
        to: user.email,
        subject: 'CVS Reset Email',
        stringType: 'text',
        stringText: 'You are receiving this because you (or someone else) have requested to edit your email..\n\n' +
          'Please click on the following link, or paste this into your browser to complete the reset email process:\n\n' +
          `${config.serverUrl}:${config.port}/${user.role}/email/` + encodeURIComponent(tokenUrl) + '\n\n' +
          'If you did not request this, please ignore this email.\n'
    });
    if(!success) {
        console.log(`- Error Sending reset Email to User: ${user._id}`);
        console.log({message: message, status: status});
    }
    else {
        console.log(`- Sent reset Email to User: ${user._id} Successfly}`);
        console.log(message);
    }
});

eventEmitter.on('reset_password', async user => {
    let tokenUrl = jwt.sign(user, config.jwtSecret);
    const {message, success, status} = await sendMail({
        to: user.email,
        subject: 'CVS Reset Password',
        stringType: 'text',
        stringText: 'You are receiving this because you (or someone else) have requested to reset your password..\n\n' +
          'Please click on the following link, or paste this into your browser to complete the reset password process:\n\n' +
          `${config.serverUrl}:${config.port}/${user.role}/password/` + encodeURIComponent(tokenUrl) + '\n\n' +
          'If you did not request this, please ignore this email.\n'
    });
    if(!success) {
        console.log(`- Error Sending reset password to User: ${user._id}`);
        console.log({message: message, status: status});
    }
    else {
        console.log(`- Sent reset Password to User: ${user._id} Successfly}`);
        console.log(message);
    }
});

async function Emit(eventName, eventData) {
    eventEmitter.emit(eventName, eventData)
};

module.exports = {
    Emit
};