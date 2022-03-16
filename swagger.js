const swaggerAutogen = require('swagger-autogen')();
const { description, name, version } = require('./package.json');

const doc = {
  info: {
    version,
    title: name,
    description: description ?? '',
  },
};

const outputFile = './swagger/swagger-output.json';
const endpointsFiles = ['./src/routes/index.js'];

(async () => swaggerAutogen(outputFile, endpointsFiles, doc))();
