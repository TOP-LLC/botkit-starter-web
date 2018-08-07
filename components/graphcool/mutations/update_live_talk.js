const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (talkId) => {
  console.log('Change current Live talk to PostLive',);

  const mutationQuery = `($talkId: ID!) {
    updateTalk(
      id: $talkId
      status: PostLive
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
      debug('Updated Live Talk status', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating Live Talk ', error);
      return { data: error };
    });
};
