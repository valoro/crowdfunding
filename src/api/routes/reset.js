const { Router } = require('express');
const router = Router();
const { Emit } = require('../../subscribers/user');

module.exports = (app) => {
    app.use('/reset', router);

    router.post('/email', async (req, res) => {
        let user = res.locals.user;
        Emit('reset_email', user);
        res.json({message: 'email sent'});
    });

    router.post('/password', async (req, res) => {
        let user = res.locals.user;
        Emit('reset_password', user);
        res.json({message: 'email sent'});
    });
};