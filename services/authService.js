const User = require("../models/User");

exports.fetchUser = async (id) => {
  let user;
  try {
    user = await User.findOne({ _id: id });
  } catch (e) {
    console.error("!checkUserId [", id, "] => ", e.message);
  }
  return user;
};
