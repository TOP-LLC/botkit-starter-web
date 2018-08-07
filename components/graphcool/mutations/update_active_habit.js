const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_phone_number');

module.exports = (habitId) => {
  console.log('Change active Habit to false',);

  const mutationQuery = `($habitId: ID!) {
    updateHabit(
      id: $habitId
      active: false
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
      debug('Updated active Habit to false ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating active habit ', error);
      return { data: error };
    });
};
