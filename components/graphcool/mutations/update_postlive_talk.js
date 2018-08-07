const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (talkId) => {
  console.log('Change current PostLive talk to Past',);

  const mutationQuery = `($talkId: ID!) {
    updateTalk(
      id: $talkId
      status: Past
      current: false
    ) {
      id
      status
      date
    }
  }
  `;

  const vars = {
    talkId,
  };

  return lokkaClient
    .mutate(mutationQuery, vars)
    .then((result) => {
      debug('Updated PostLive Talk status and current ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating PostLive Talk ', error);
      return { data: error };
    });
};
