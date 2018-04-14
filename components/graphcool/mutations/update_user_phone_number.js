const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (userId, phoneSMS) => {
  console.log('Add phone to user DB', userId, phoneSMS);

  const mutationQuery = `($userId: ID!, $phoneSMS: String!){
      updateUser(id: $userId, phoneSMS: $phoneSMS) {
        id
        phoneSMS
      }
    }
  `;

  const vars = {
    userId,
    phoneSMS,
  };

  return lokkaClient
    .mutate(mutationQuery, vars)
    .then((result) => {
      debug('Added phone number ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in adding phoneSMS ', error);
      return { data: error };
    });
};
