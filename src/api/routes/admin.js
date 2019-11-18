const { Router } = require('express');
const router = Router();
const config = require('../../config');
const { userType, registerAdmin } = require('../middlewares/validator');
const { Individual, Organization, Admin, Fabric } = require('../../services');

module.exports = app => {
    app.use('/admin', userType(config.roles.admin), router);

    router.post('/register', registerAdmin, async (req, res) => {
        try {
            let user = await Admin.addUser(res.locals.validatedUser);
            return res.json(user)
        } catch (error) {
            return res.status(error.message? error.message: 500).json(error.message);
        }
    });

    router.post('/individual/activate/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let user = await Individual.updateUser(id, {
                status: config.userStatus.activated
            });
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/individual/deactivate/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let user = await Individual.updateUser(id, {
                status: config.userStatus.deactivated
            });
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/organization/activate/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let user = await Organization.updateUser(id, {
                status: config.userStatus.activated
            });
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/organization/deactivate/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let user = await Organization.updateUser(id, {
                status: config.userStatus.deactivated
            });
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/individual/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let user = await Individual.getOneUser({_id: id});
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/individual', async (req, res) => {
        try {
            let users = await Admin.getAllIndividuals();
            res.json(users);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.delete('/individual/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let certClaims = await Fabric.Asset.queryAssetByProp({
                docType: 'certificateClaim',
                individualId : id
            });
            let expClaims = await Fabric.Asset.queryAssetByProp({
                docType: 'experienceClaim',
                individualId : id
            });
            let claims = [...certClaims, ...expClaims];
            claims.map(async claim => {
                await Fabric.Asset.deleteAsset(claim.Key);
            });
            let user = await Individual.deleteUser(id);
            user.certificates = claims;
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/organization/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let user = await Organization.getOneUser({_id: id});
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/organization', async (req, res) => {
        try {
            let users = await Admin.getAllOrganizations();
            res.json(users);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.delete('/organization/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let certOrg = await Fabric.Asset.queryAssetByProp({
                docType: 'certificateClaim',
                organizationId : id
            });
            let expOrg = await Fabric.Asset.queryAssetByProp({
                docType: 'experienceClaim',
                organizationId : id
            });
            let orgs = [...certOrg, ...expOrg];
            orgs.map(async org => {
                await Fabric.Asset.deleteAsset(org.Key);
            });
            let user = await Organization.deleteUser(id);
            user.orgInfo = orgs;
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/admin/:id', async (req, res) => {
        let id = req.params.id;
        try {
            let user = await Admin.getOneUser({_id: id});
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/admin', async (req, res) => {
        try {
            let users = await Admin.getUser({});
            res.json(users);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });
};