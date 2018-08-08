const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (habitId) => {
  console.log('Change next Habit to active true',);

  const mutationQuery = `($habitId: ID!) {
    updateHabit(
      id: $habitId
      active: true
    ) {
      id
			active
    }
  }
  `;

  const vars = {
    habitId,
  };

  return lokkaClient
    .mutate(mutationQuery, vars)
    .then((result) => {
      debug('Updated next habit to active true ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating next habit to true', error);
      return { data: error };
    });
};
