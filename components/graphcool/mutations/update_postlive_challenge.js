const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (challengeId) => {
  console.log('Change current PostLive challenge to false',);

  const mutationQuery = `mutation ($challengeId: ID!) {
    updateSeriesChallenge(
      id: $challengeId
      current: false
    ) {
      id
    }
  }  
  `;

  const vars = {
    challengeId,
  };

  return lokkaClient
    .mutate(mutationQuery, vars)
    .then((result) => {
      debug('Updated current PostLive challenge to past ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating PostLive Challenge ', error);
      return { data: error };
    });
};
