const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (challengeId) => {
  console.log('Change current PreLive Challenge to true',);

  const mutationQuery = `($challengeId: ID!) {
    updateSeriesChallenge(
      id: $challengeId
      current: true
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
      debug('Updated current PreLive challenge to current ', result.updateSeriesChallenge);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating PreLive Challenge ', error);
      return { data: error };
    });
};
