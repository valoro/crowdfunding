const { Router } = require('express');
const router = Router();
const config = require('../../config');
const { userType } = require('../middlewares/validator');
const { shareClaim } = require('../../services/individual');
const { Asset } = require('../../services/fabric');

module.exports = app => {
    app.use('/individual', userType(config.roles.individual), router);

    router.post('/claim/certificate', async (req, res) => {
        try {
            let user = res.locals.user;
            let claim = {
                degreeType: req.body.degreeType,
                department: req.body.department,
                claimPeriod: req.body.claimPeriod,
                organizationId: req.body.organizationId,
                individualId: user._id,
                identityNumber: user.identityNumber
            };
            let txResponse = await Asset.transactionExcute(['submit', 'createCertificateClaim', JSON.stringify(claim)]);
            res.json(txResponse);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/claim/experience', async (req, res) => {
        try {
            let user = res.locals.user;
            let claim = {
                industry : req.body.industry,
                employmentId : req.body.employmentId,
                yearsOfExperience : req.body.yearsOfExperience,
                designation : req.body.designation,
                claimPeriod : req.body.claimPeriod,
                organizationId: req.body.organizationId,
                individualId: user._id,
                identityNumber: user.identityNumber
            };
            let txResponse = await Asset.transactionExcute(['submit', 'createExperienceClaim', JSON.stringify(claim)]);
            res.json(txResponse);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.post('/claim/share', async (req, res) => {
        try {
            let url = await shareClaim(res.locals.user, req.body.certificateKey);
            res.json(url);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);            
        }
    });

    router.get('/claim/certificate', async (req, res) => {
        try {
            let user = res.locals.user;
            let claims = await Asset.queryAssetByProp({
                docType: 'certificateClaim',
                individualId : user._id
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
                individualId : user._id
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
                individualId : user._id
            });
            res.json(claims);
        } catch (error) {
            res.status(error.status ? error.status: 500).json(error.message);
        }
    });

    router.get('/', async (req, res) => {
        try {
            let user = res.locals.user;
            let claims = await Asset.queryAssetByProp({
                individualId: user._id
            });
            user.certificates = claims;
            res.json(user);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });
};