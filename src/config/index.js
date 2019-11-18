const dotenv = require('dotenv');

const envFound = dotenv.config();
if (!envFound) {
    throw new Error(' Couldn\'t find .env file!');
}

module.exports = {
    port: parseInt(process.env.PORT, 10),
    api: {
        prefix: '/',
    },
    serverUrl: process.env.SERVER_URL,
    dbUserName: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    jwtSecret: process.env.JWT_SECRET,
    S3Bucket: process.env.S3_BUCKET,
    roles: {
        individual: 'individual',
        organization: 'organization',
        admin: 'admin'
    },
    userStatus: {
        activated: 'activated',
        deactivated: 'deactivated',
        pendingOTP: 'pendingOTP',
        requested: 'requested'
    },
    twilioCredentials: {
        accountSid : process.env.TWILIO_ACCOUNT_SID,
        authToken : process.env.TWILIO_AUTH_TOKEN
    },
    mailCredentials: {
        serviceProvider: 'Gmail',
        user: 'certverifsys123@gmail.com',
        pass: process.env.GMAIL_PASSWORD
    }
};