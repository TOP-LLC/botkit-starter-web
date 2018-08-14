const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (talkId) => {
  console.log('Change current Live talk to Past',);

  const mutationQuery = `($talkId: ID!) {
    updateTalk(
      id: $talkId
      status: Past
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
      debug('Updated Live Talk to Past ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating Live Talk to Past', error);
      return { data: error };
    });
};
