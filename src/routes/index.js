const express = require('express');

const { getProfile } = require('../middleware/getProfile');
const contracts = require('./handlers/contracts.handler');

const router = express.Router();

router.use(getProfile);

router.get('/contracts/:id', contracts.getById);

module.exports = {
  router,
};
