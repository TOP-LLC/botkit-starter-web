const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_submitted_form');

module.exports = (userId, submittedForm) => {
  console.log('Update user submittedForm for ', userId);

  const mutationQuery = `($userId: ID!, $submittedForm: Boolean){
      updateUser(id: $userId, submittedForm: $submittedForm) {
        id
        submittedForm
      }
    }
  `;

  const vars = {
    userId,
    submittedForm: !submittedForm,
  };

  return lokkaClient
    .mutate(mutationQuery, vars)
    .then((result) => {
      debug('Updated submitted form ', result);
      return { data: result };
    })
    .catch((error) => {
      debug('Error in updating submitted form ', error);
      return { error };
    });
};
