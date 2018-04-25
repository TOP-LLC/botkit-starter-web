const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_loginNotice');

module.exports = (userId) => {
  console.log('Set progressCurrent events to InProgress');

  const updateLoginNotice = async () => {
    const mutationQuery = `($userId: ID!) {
        updateUser (
          id: $userId
          loginNotice: None
        ) {
          id
        }
      }
    `;

    const vars = {
      userId,
    };

    return lokkaClient
      .mutate(mutationQuery, vars)
      .then((result) => {
        debug('Updated loginNotice, result');
        return { data: result };
      })
      .catch((error) => {
        debug('Error updating loginNotice ', error);
        return { data: error };
      });
  };

  return updateLoginNotice()
    .then((data) => {
      console.log('Completed updating user login notice to None ', data);
      return { data };
    })
    .catch((err) => {
      console.log('Error updating loginNotice ', err);
      return { data: err };
    });
};
