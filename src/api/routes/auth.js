const { Router } = require('express');
const router = Router();
const validator = require('../middlewares/validator');
const { Individual, Organization, Admin } = require('../../services');
const { Emit } = require('../../subscribers/user');

module.exports = (app) => {
    app.use('/', router);

    router.post('/individual/register', validator.registerIndividual, async (req, res) => {
        try {
            let user = await Individual.addUser(res.locals.validatedUser);
            Emit('individual_register', user);
            return res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/organization/register', validator.registerOrganization, async (req, res) => {
        try {
            let user = await Organization.addUser(res.locals.validatedOrg);
            Emit('organization_register', user);
            return res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/individual/authenticate', async (req, res) => {
        try {
            let token = await Individual.authUser(req.body.identityNumber, req.body.password);
            return res.json(token);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/organization/authenticate', async (req, res) => {
        try {
            let token = await Organization.authUser(req.body.identityNumber, req.body.password);
            return res.json(token);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/admin/authenticate', async (req, res) => {
        try {
            let token = await Admin.authUser(req.body.identityNumber, req.body.password);
            return res.json(token);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

};