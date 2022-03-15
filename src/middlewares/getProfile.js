const getProfile = async (req, res, next) => {
  const { Profile } = req.app.get('models');
  let profile;

  try {
    const options = { where: { id: req.get('profile_id') || 0 } };
    profile = await Profile.findOne(options);

    if (!profile) {
      return res.status(401).end();
    }

    req.profile = profile;
    return next();
  } catch (error) {
    // TODO: log error
    return next(error);
  }
};

module.exports = { getProfile };
