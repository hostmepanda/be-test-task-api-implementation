const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

const { sequelize } = require('./models');
const { router } = require('./routes');
const swaggerConfig = require('../swagger/swagger-output.json');

const app = express();

app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(bodyParser.json());
app.use('/', router);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

module.exports = app;
