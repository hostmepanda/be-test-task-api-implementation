const express = require('express');

const { allowOnlyClients, getProfile } = require('../middlewares');
const admin = require('./handlers/admin.handler');
const balances = require('./handlers/balances.handler');
const contracts = require('./handlers/contracts.handler');
const jobs = require('./handlers/jobs.handler');

const router = express.Router();

router.use(getProfile);

router.get('/admin/best-profession', admin.listBestProfessionByRange);

router.post('/balances/deposit/:userId', allowOnlyClients, balances.depositByUserId);

router.get('/contracts/:id', contracts.getById);
router.get('/contracts', contracts.list);

router.post('/jobs/:job_id/pay', allowOnlyClients, jobs.payById);
router.get('/jobs/unpaid', jobs.listUnpaid);

module.exports = {
  router,
};
