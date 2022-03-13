// TODO: find more common place for error reasons
const PROFILE_IS_NOT_AUTHORIZED = 'You profile is not authorized to perform the request';

const allowOnlyClients = (req, res, next) => {
  const isClientProfile = req.profile?.type === 'client';
  if (!isClientProfile) {
    return res
      .status(403)
      .send({
        success: false,
        reason: PROFILE_IS_NOT_AUTHORIZED,
      });
  }
  return next();
};

module.exports = {
  allowOnlyClients,
};
