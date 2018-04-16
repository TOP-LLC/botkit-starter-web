const lokkaClient = require('./../../lokka_graphcool.js');

module.exports = (userId) => {
  console.log('Querying for all events', userId);

  // Query for Training Message
  return lokkaClient
    .query(`
    query {
      allEvents (filter: {schedule: {user: {id: "${userId}"}}}, orderBy: startDate_ASC) {
        id
        type
        startDate
      }
    }
  `)
    .then((result) => {
      console.log('Result of all Events ', result);
      return result.allEvents;
    });
};
