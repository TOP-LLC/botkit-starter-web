const lokkaClient = require('./../../lokka_graphcool');

module.exports = (id) => {
  console.log('Run user query with ID ', id);

  return lokkaClient
    .query(`
      query {
        allUsers(filter: {status: Active, type: Client, loginNotice: None phoneSMS_not: null}) {
          id
          firstName
          lastName
          phoneSMS
        }
      }      
    `)
    .then((result) => result.allUsers);
};
