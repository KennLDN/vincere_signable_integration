const User = require('../models/Users');
const vincereRequest = require('./vincereRequest');
const { fetchUsers } = require('../scripts/signableScripts');
const config = require('../config');
const logger = require('./logger')('FETCH AND STORE USERS');

const fetchAndStoreUsers = async () => {
  try {
    const vincereResponse = await vincereRequest({
      method: 'get',
      url: `https://${config.vincereTenantUrl}/api/v2/user/summaries/all`,
    });

    const customUsersResponse = await fetchUsers(false);
    const customUsers = customUsersResponse.users;

    for (const userData of vincereResponse.data) {
      const { email, id, full_name } = userData;

      const matchingCustomUser = customUsers.find(user => user.user_name === full_name);
      const signable_id = matchingCustomUser ? parseInt(matchingCustomUser.user_id) : null;

      const existingUser = await User.findOne({ id });

      if (existingUser) {
        if (existingUser.email !== email || existingUser.full_name !== full_name || existingUser.signable_id !== signable_id) {
          await User.updateOne({ id }, { email, full_name, signable_id });
        }
      } else {
        await User.create({ email, id, full_name, signable_id });
      }
    }

    const allUsers = await User.find({});
    logger.res({
      msg: 'Users fetched and stored/updated successfully. Current Users:', 
      error: JSON.stringify(allUsers, null, 2),
      status: 200
    });
  } catch (error) {
    logger.res({ msg: 'Error fetching and storing users.', error: error.toString(), status: 500 });
  }
};

module.exports = fetchAndStoreUsers;
