const { Router } = require('express');
const router = Router();
const config = require('../../config');
const { userType } = require('../middlewares/validator');
const { Asset } = require('../../services/fabric');

module.exports = app => {
    app.use('/organization', userType(config.roles.organization), router);

    router.post('/claim/approve/:claimId', async (req, res) => {
        try {
            let user = res.locals.user;
            let claimId = req.params.claimId;
            let txResponse = await Asset.transactionExcute(['submit', 'approveClaim', JSON.stringify({
                claimId: claimId,
                organizationId: user._id
            })])
            res.json(txResponse);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/certificate', async (req, res) => {
        try {
            let user = res.locals.user;
            let orgInfo = {
                degreeTypes: req.body.degreeTypes,
                departments: req.body.departments,
                organizationId: user._id,
                organizationName: user.organizationName
            };
            let txResponse = await Asset.transactionExcute(['submit', 'createCertificateOrganization', JSON.stringify(orgInfo)]);
            res.json(txResponse);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/experience', async (req, res) => {
        try {
            let user = res.locals.user;
            let orgInfo = {
                industries: req.body.industries,
                designations: req.body.designations,
                organizationId: user._id,
                organizationName: user.organizationName
            };
            let txResponse = await Asset.transactionExcute(['submit', 'createExperienceOrganization', JSON.stringify(orgInfo)]);
            res.json(txResponse);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/claim/certificate', async (req, res) => {
        try {
            let user = res.locals.user;
            let claims = await Asset.queryAssetByProp({
                docType: 'certificateClaim',
                organizationId : user._id
            });
            res.json(claims);
        } catch (error) {
            res.status(error.status ? error.status: 500).json(error.message);
        }
    });

    router.get('/claim/experience', async (req, res) => {
        try {
            let user = res.locals.user;
            let claims = await Asset.queryAssetByProp({
                docType: 'experienceClaim',
                organizationId : user._id
            });
            res.json(claims);
        } catch (error) {
            res.status(error.status ? error.status: 500).json(error.message);
        }
    });

    router.get('/claim', async (req, res) => {
        try {
            let user = res.locals.user;
            let claims = await Asset.queryAssetByProp({
                type: 'claim',
                organizationId : user._id
            });
            res.json(claims);
        } catch (error) {
            res.status(error.status ? error.status: 500).json(error.message);
        }
    });

    router.get('/', async (req, res) => {
        try {
            let user = res.locals.user;
            let orgInfo = await Asset.queryAssetByProp({
                organizationId: user._id,
                type: 'org'
            });
            user.orgInfo = orgInfo;
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

};