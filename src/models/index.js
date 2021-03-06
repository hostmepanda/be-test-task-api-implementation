const { Contract } = require('./Contract.model');
const { Job } = require('./Job.model');
const { Profile } = require('./Profile.model');
const { sequelize } = require('../databases');

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Profile.hasMany(Contract, { as: '', foreignKey: 'ClientId' });

Contract.belongsTo(Profile, { as: 'Contractor' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);

Job.belongsTo(Contract);

module.exports = {
  Job,
  Contract,
  Profile,
  sequelize,
};
