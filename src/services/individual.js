const { Individual } = require('../models');
const bcrypt = require('bcrypt');
const config = require('../config');
const { Asset } = require('./fabric');
const Client = require('twilio')(config.twilioCredentials.accountSid, config.twilioCredentials.authToken);
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

async function addUser(user) {
    return new Promise( async (resolve, reject) => {
        try {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(user.password, salt);
        console.log(salt);
        user.password = hash;
        let newUser = new Individual(user);
        newUser.save((err, user) => {
            if(err){
                return reject({message: err, status: 500});
            }
            user = user.toObject();
            delete user.password;
            return resolve(user);
        });
        } catch (error) {
            return reject({message: error, status: 500});
        }
    });
};

async function getUser(properties) {
    return new Promise((resolve, reject) => {
        if (!!properties && properties.constructor === Object) {
            Individual.find(properties).lean().exec((err, users) => {
                if(err){
                    return reject({message: err, status: 413});
                }
                users.map(user => {
                    delete user.password;
                });
                return resolve(users);
            })
        }
        else {
            return reject({message: 'properties field must be of type object', status: 413});
        }
    });
};

async function getOneUser(properties) {
    return new Promise( async (resolve, reject) => {
        getUser(properties)
        .then(users => {
            if(users.length === 0) {
                return reject({message: 'no such user', status: 404});
            }
            return resolve(users[0]);
        })
        .catch(err => {
            return reject(err);
        })
    });
};

async function updateUser(userId, properties) {
    return new Promise((resolve, reject) => {
        if (!!properties && properties.constructor === Object) {
            Individual.findByIdAndUpdate({_id: userId}, properties, {new: true}).lean().exec((err, user) =>{
                if (err){
                    return reject({message: err, status: 500});
                }
                if (!user) {
                    return reject({message: 'no such user', status: 404});
                }
                delete user.password;
                return resolve(user);
            });
        }
        else {
            return reject({message: 'properties field must be of type object', status: 413});
        }
    });
};

async function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        Individual.findByIdAndDelete({_id: userId}, (err, user) => {
            if (err){
                return reject({message: err, status: 500});
            }
            if (!user) {
                return reject({message: 'no such user', status: 404});
            }
            delete user.password;
            return resolve(user);
        });
    });
};

async function authUser(identityNumber, password) {
    return new Promise((resolve, reject) => {
        Individual.find({identityNumber: identityNumber}).lean().exec(async(err, users) => {
            if(err){
                return reject({message: err, status: 500});
            }
            if(users.length === 0) {
                return reject({message: 'no such user!', status: 404});
            }
            let user = users[0];
            bcrypt.compare(password, user.password, (err, same) => {
                if(err || !same) {
                    return reject({message: 'wrong password', status: 413});
                }
                delete user.password;
                const token = jwt.sign(user, config.jwtSecret, {
                    expiresIn: 604800 // 7 days
                });
                return resolve({
                    user: user,
                    token: 'JWT ' + token
                });
            });
        })
    });
};

async function verifyMobile(identityNumber, oneTimePassword) {
    return new Promise( async (resolve, reject) => {
        let user = await getOneUser({identityNumber: identityNumber});
        if (!user) {
            return reject({message: 'no such user', status: 404});
        }
        if(Date.now() > user.oneTimePasswordExpiresAt) {
            return reject({message: 'one time password expired', status: 413});
        }
        Client.verify.services(user.oneTimePasswordSid).verificationChecks.create({
            to: user.mobile, code: oneTimePassword
        }, (err, verificationCheck) => {
            if(verificationCheck.status !== 'approved' || err){
                return reject({message: err? err: 'one time password not valid', status: 413});
            }
            updateUser(user._id, {status: config.userStatus.requested})
            .then(user => {
                return resolve(user);
            })
            .catch(err => {
                return reject({message: err, status: 500});
            })
        })
    });
};

async function updatePassword(id, newPassword) {
    return new Promise( async (resolve, reject) => {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(newPassword, salt);
        updateUser(id, {
            password: hash
        })
        .then(user => {
            return resolve(user);
        })
        .catch(err => {
            return reject({message: err, status: 404});
        })
    });
};

async function shareClaim(user, certificateKey) {
    return new Promise(async (resolve, reject) => {
        try {
            let claim = await Asset.queryAsset(certificateKey);
            if(claim.individualId !== user._id) throw {message: 'claim does\'nt belong to user', status: 401}
            if(!claim.file || claim.file == '') throw {message: 'no file to share, wait for university response', status: 404}
            let url = await shareS3File(certificateKey + '.pdf');
            return resolve(url);
        } catch (error) {
            return reject(error);
        }
    });
};

async function shareS3File(key) {
    return new Promise((resolve, reject) => {
        AWS.config.getCredentials((err) => {
            if (err) return reject(err.stack);
        });
        s3 = new AWS.S3();
        const params = {
            Bucket: config.S3Bucket,
            Key: key
        };
        s3.getObject(params, (err, data) => {
            if (err) return reject(err);
            params.Expires = 60 * 60 * 48 ; // expires in 2 days
            s3.getSignedUrl('getObject', params, (err, url) => {
                if (err) return reject(err);
                return resolve(url);
            });
        });
    });
};

module.exports = {
    addUser,
    getUser,
    getOneUser,
    updateUser,
    deleteUser,
    authUser,
    verifyMobile,
    updatePassword,
    shareS3File,
    shareClaim
};