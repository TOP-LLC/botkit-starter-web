const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (talkId) => {
  console.log('Change current PreLive talk to Current',);

  const mutationQuery = `($talkId: ID!) {
    updateTalk(
      id: $talkId
      status: PreLive
      current: true
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
      debug('Updated PreLive Talk status and current ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating PreLive Talk ', error);
      return { data: error };
    });
};
