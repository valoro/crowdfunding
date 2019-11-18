const { Admin } = require('../models');
const bcrypt = require('bcrypt');
const config = require('../config');
const jwt = require('jsonwebtoken');
const Individual = require('./individual');
const Organization = require('./organization');
const Fabric = require('./fabric')

async function addUser(user) {
    return new Promise( async (resolve, reject) => {
        try {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        let newUser = new Admin(user);
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
            Admin.find(properties).lean().exec((err, users) => {
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
            Admin.findByIdAndUpdate({_id: userId}, properties, {new: true}).lean().exec((err, user) =>{
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
        Admin.findByIdAndDelete({_id: userId}, (err, user) => {
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
        console.log(identityNumber, password);
        Admin.find({identityNumber: identityNumber}).lean().exec( async (err, users) => {
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

async function getAllIndividuals() {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await Individual.getUser({});
            let userCert = await Fabric.Asset.queryAssetByProp({docType: 'certificateClaim'});
            let userExp = await Fabric.Asset.queryAssetByProp({docType: 'experienceClaim'});
            users.map(user => {
                user.certificates = [];
                userCert.map(cert => {
                    if (cert.Record.individualId == user._id) {
                        user.certificates.push(cert);
                    }
                });
                userExp.map(exp => {
                    if (exp.Record.individualId == user._id) {
                        user.certificates.push(exp);
                    }
                });
            });
            return resolve(users);
        } catch (error) {
            return reject(error);
        }
    });
};

async function getAllOrganizations() {
    return new Promise(async (resolve, reject) => {
        try {
            let orgs = await Organization.getUser({});
            let orgCert = await Fabric.Asset.queryAssetByProp({docType: 'certificateOrg'});
            let orgExp = await Fabric.Asset.queryAssetByProp({docType: 'experienceOrg'});
            orgs.map(org => {
                org.orgInfo = [];
                orgCert.map(cert => {
                    if (cert.Record.organizationId == org._id) {
                        org.orgInfo.push(cert);
                    }
                });
                orgExp.map(exp => {
                    if (exp.Record.organizationId == org._id) {
                        org.orgInfo.push(exp);
                    }
                });
            });
            return resolve(orgs);
        } catch (error) {
            return reject(error);
        }
    });
};

module.exports = {
    addUser,
    getUser,
    getOneUser,
    updateUser,
    deleteUser,
    authUser,
    getAllIndividuals,
    getAllOrganizations
};