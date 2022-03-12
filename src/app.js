const express = require('express');
const bodyParser = require('body-parser');

const { sequelize } = require('./models');
const { router } = require('./routes');

const app = express();

app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(bodyParser.json());
app.use('/', router);

module.exports = app;
