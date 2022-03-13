const express = require('express');

const { getProfile } = require('../middleware/getProfile');
const contracts = require('./handlers/contracts.handler');
const jobs = require('./handlers/jobs.handler');

const router = express.Router();

router.use(getProfile);

router.get('/contracts/:id', contracts.getById);
router.get('/contracts', contracts.list);
router.get('/jobs/unpaid', jobs.listUnpaid);

module.exports = {
  router,
};
