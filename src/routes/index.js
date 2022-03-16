const express = require('express');

const { allowOnlyClients, getProfile } = require('../middlewares');
const admin = require('./handlers/admin.handler');
const balances = require('./handlers/balances.handler');
const contracts = require('./handlers/contracts.handler');
const jobs = require('./handlers/jobs.handler');

const router = express.Router();

router.get('/admin/best-profession', getProfile, admin.listBestProfession);
router.get('/admin/best-clients', getProfile, admin.listBestClients);

router.post('/balances/deposit/:userId', getProfile, allowOnlyClients, balances.depositByUserId);

router.get('/contracts/:id', getProfile, contracts.getById);
router.get('/contracts', getProfile, contracts.list);

router.post('/jobs/:job_id/pay', getProfile, allowOnlyClients, jobs.payById);
router.get('/jobs/unpaid', getProfile, jobs.listUnpaid);

module.exports = {
  router,
};
