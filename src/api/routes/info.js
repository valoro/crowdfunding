const { Router } = require('express');
const router = Router();
const { Organization, Admin } = require('../../services');
const config = require('../../config');
const { userType } = require('../middlewares/validator');
const path = require('path');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

module.exports = app => {
    app.use('/', router);

    router.get('/organization/available', async (req, res) => {
        try {
            let users = await Admin.getAllOrganizations();
            res.json(users);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

    router.get('/organization/upload', async (req, res) => {
        res.sendFile(path.join(__dirname, '../../docs/upload.html'));
    });

    router.post('/organization/upload', upload.single('file-to-upload'), userType(config.roles.organization), 
    async (req, res) => {
        try {
            let claim = await Organization.uploadClaim(res.locals.user, req.body.certificateKey, req.file);
            res.json(claim);
        } catch (error) {
            return res.status(error.status? error.status: 500).json(error.message);
        }
    });

};