const swaggerJSDoc = require('swagger-jsdoc');
const config = require('../../config');

// Swagger definition
const swaggerDefinition = {
  info: {
    title: 'REST API for Certificate Verification System',
    version: '1.1.0',
    description: 'This is the REST API for testing the Back-end',
  },
  host: `${config.serverUrl}:${config.port}`,
  basePath: config.api.prefix,
};

// options for the swagger docs
const options = {
  swaggerDefinition,
  // path to the API docs
  // apis: ['./src/docs/**/*.yaml'],
  apis: ['./src/docs/register.yaml'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerSpec: swaggerSpec
};