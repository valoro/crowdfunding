const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../../config');

module.exports = (passport) => {
        const opts = {};
        opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
        opts.secretOrKey = config.jwtSecret;
        return passport.use(
            new JwtStrategy(opts, (jwt_payload, done) => {
                if (jwt_payload.status !== config.userStatus.activated && jwt_payload.role !== config.roles.admin) {
                    return done(null, false);
                }
                return done(null, jwt_payload);
            })
        );
}