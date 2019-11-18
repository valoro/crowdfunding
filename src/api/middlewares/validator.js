const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const config = require('../../config');

const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&()*+,-./:;<=>?@^`|~{}'?_&])[A-Za-z\d!#$%&()*+,-./:;<=>?@^`|~{}'?_&]{8,}$/).required(),
    repeatPassword: Joi.ref('password'),
    identityNumber: Joi.string().pattern(/^(2|1)([0-9]{9})$/).required(),
    mobile: Joi.string().pattern(/^(\+201)[0-9]{9}$/).required()
}).with('password', 'repeatPassword');

const orgSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    organizationName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&()*+,-./:;<=>?@^`|~{}'?_&])[A-Za-z\d!#$%&()*+,-./:;<=>?@^`|~{}'?_&]{8,}$/).required(),
    repeatPassword: Joi.ref('password'),
    identityNumber: Joi.string().pattern(/^(2|1)([0-9]{9})$/).required(),
    organizationRegistrationNumber: Joi.string().pattern(/^(2|1)([0-9]{9})$/).required(),
    mobile: Joi.string().pattern(/^(\+201)[0-9]{9}$/).required(),
    fileUpload: Joi.string().required()
}).with('password', 'repeatPassword');

function registerIndividual (req, res, next) {
    userSchema.validateAsync({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        repeatPassword: req.body.repeatPassword,
        identityNumber: req.body.identityNumber,
        mobile: req.body.mobile
    })
    .then(user => {
        console.log('inside validator: ', user);
        res.locals.validatedUser = user;
        return next();
    })
    .catch(err => {
        return res.status(413).json(err);
    })
};

function registerOrganization (req, res, next) {
    orgSchema.validateAsync({
        name: req.body.name,
        organizationName: req.body.organizationName,
        organizationRegistrationNumber: req.body.organizationRegistrationNumber,
        email: req.body.email,
        password: req.body.password,
        repeatPassword: req.body.repeatPassword,
        identityNumber: req.body.identityNumber,
        mobile: req.body.mobile,
        fileUpload: req.body.fileUpload
    })
    .then(org => {
        res.locals.validatedOrg = org;
        return next();
    })
    .catch(err => {
        return res.status(413).json(err);
    })
};

function registerAdmin (req, res, next) {
    userSchema.validateAsync({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        repeatPassword: req.body.repeatPassword,
        identityNumber: req.body.identityNumber,
        mobile: req.body.mobile
    })
    .then(user => {
        res.locals.validatedUser = user;
        return next();
    })
    .catch(err => {
        return res.status(413).json(err);
    })
};

function resetEmail (req, res, next) {
    let email = req.body.email;
    let token = req.params.token;
    jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
        if(err) {
            return res.status(422).json('token is wrong or expired');
        }
        const emailSchema = Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required();
        const { error } = emailSchema.validate({email});
        if (error) {
            return res.status(413).json(error);
        }
        res.locals.user = decodedToken;
        return next();
    });
};

function resetPassword (req, res, next) {
    let newPassword = req.body.newPassword;
    let newPasswordRepeat = req.body.newPasswordRepeat;
    let token = req.params.token;
    jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
        if(err) {
            return res.status(422).json('token is wrong or expired');
        }
        const passSchema = Joi.object({
            newPassword: Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&()*+,-./:;<=>?@^`|~{}'?_&])[A-Za-z\d!#$%&()*+,-./:;<=>?@^`|~{}'?_&]{8,}$/).required(),
            newPasswordRepeat: Joi.ref('newPassword')
        }).with('newPassword', 'newPasswordRepeat');
        passSchema.validateAsync({ newPassword, newPasswordRepeat })
        .then(() => {
            res.locals.user = decodedToken;
            return next();
        })
        .catch(err => {
            return res.status(413).json(err);
        });
    });
};

function userType(type) {
    return (req, res, next) => {
        let user;
        if(!res.locals || !res.locals.user){
            let token;
            req.headers.authorization? token = req.headers.authorization: token = req.body.authorization;
            token = token.split(' ')[1];
            jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
                if(err){
                    return res.status(401).json(err);
                }
                user = decodedToken;
                res.locals.user = user;
            });
        }
        user = res.locals.user;
        if (user.role !== type) {
            return res.status(401).json('Unauthorized');
        }
        return next();
    }
};

module.exports = {
    registerIndividual,
    registerOrganization,
    registerAdmin,
    resetEmail,
    resetPassword,
    userType
};