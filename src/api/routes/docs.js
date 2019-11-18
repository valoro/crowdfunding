const swaggerUi = require('swagger-ui-express');
const {swaggerSpec} = require('../middlewares/swagger');

module.exports = app => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec), (req, res, next) => {
        next();
    })
};