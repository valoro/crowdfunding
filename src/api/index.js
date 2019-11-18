const { Router } = require('express');
const passport = require('passport');
const docs = require('./routes/docs');
const auth = require('./routes/auth');
const reset = require('./routes/reset');
const admin = require('./routes/admin');
const info = require('./routes/info');
const individual = require('./routes/individual');
const organization = require('./routes/organization');
const verification = require('./routes/verification');

module.exports = () => {
    const app = Router();
    docs(app);
    auth(app);
    info(app);
    verification(app);
    app.use(passport.authenticate('jwt', { session: false }), (req, res, next) => {
        res.locals.user = res.req.user;
        next();
    });
    reset(app);
    admin(app);
    individual(app);
    organization(app);

    return app;
};