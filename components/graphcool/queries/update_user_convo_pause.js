const lokkaClient = require('./../../lokka_graphcool');

module.exports = (user, convoPause) => {
  console.log('Update user pause status');

  console.log('User is ', user);

  const mutationQuery = `
    ($id: ID!, $convoPause: Boolean) {
      updateUser(
				id: $id
       	convoPause: $convoPause
      )
      {
        id
        psid
				firstName
				lastName
				convoPause
      }
    }
  `;

  const vars = {
    id: user,
    convoPause,
  };

  console.log('mutation query is ', mutationQuery);
  console.log('variables are ', vars);

  return lokkaClient.mutate(mutationQuery, vars).then((result) => {
    console.log('Updated user convo status', result);
  });
};
