const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (talkId) => {
  console.log('Change current PreLive talk to Live',);

  const mutationQuery = `($talkId: ID!) {
    updateTalk(
      id: $talkId
      status: Live
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
      debug('Updated PreLive Talk to Live ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating PreLive Talk to live', error);
      return { data: error };
    });
};
