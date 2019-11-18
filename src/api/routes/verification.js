const { Router } = require('express');
const router = Router();
const config = require('../../config');
const validator = require('../middlewares/validator');
const { Individual, Organization } = require('../../services');
const { Emit } = require('../../subscribers/user');

module.exports = (app) => {
    app.use('/', router);

    router.post('/individual/mobile', async (req, res) => {
        try {
            let identityNumber = req.body.identityNumber;
            let oneTimePassword = req.body.oneTimePassword;
            let user = await Individual.verifyMobile(identityNumber, oneTimePassword);
            return res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/organization/mobile', async (req, res) => {
        try {
            let identityNumber = req.body.identityNumber;
            let oneTimePassword = req.body.oneTimePassword;
            let user = await Organization.verifyMobile(identityNumber, oneTimePassword);
            return res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/individual/mobile/resend', async (req, res) => {
        try {
            let identityNumber = req.body.identityNumber;
            let user = await Individual.getOneUser({identityNumber: identityNumber});
            if(user.status !== config.userStatus.pendingOTP) throw {message: 'user already registered', status: 422} 
            Emit('individual_register', user);
            return res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/organization/mobile/resend', async (req, res) => {
        try {
            let identityNumber = req.body.identityNumber;
            let user = await Organization.getOneUser({identityNumber: identityNumber});
            if(user.status !== config.userStatus.pendingOTP) throw {message: 'user already registered', status: 422} 
            Emit('organization_register', user);
            return res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/individual/email/:token', validator.resetEmail, async (req, res) => {
        try {
            let user = res.locals.user;
            let updatedUser = await Individual.updateUser(user._id, {
                email: req.body.email
            });
            res.json(updatedUser);
        } catch (error) {
            return res.status(error.status).json(error.message);
        }
    });

    router.post('/organization/email/:token', validator.resetEmail, async (req, res) => {
        try {
            let user = res.locals.user;
            let updatedUser = await Organization.updateUser(user._id, {
                email: req.body.email
            });
            res.json(updatedUser);
        } catch (error) {
            return res.status(error.status).json(error.message);
        }
    });

    router.post('/individual/password/:token', validator.resetPassword, async (req, res) => {
        try {
            let user = res.locals.user;
            let newUser = await Individual.updatePassword(user._id, req.body.newPassword);
            res.json(newUser);
        } catch (error) {
            return res.status(error.status).json(error.message);
        }
    });

    router.post('/organization/password/:token', validator.resetPassword, async (req, res) => {
        try {
            let user = res.locals.user;
            let newUser = await Organization.updatePassword(user._id, req.body.newPassword);
            res.json(newUser);
        } catch (error) {
            return res.status(error.status).json(error.message);
        }
    });

};