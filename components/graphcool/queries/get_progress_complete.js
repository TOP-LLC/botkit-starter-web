const lokkaClient = require('./../../lokka_graphcool.js');

module.exports = function (psid) {
  console.log('Running progressComplete query with ID ', psid);

  // Query for Training Message
  return lokkaClient
    .query(`
    query {
      User (id: "${psid}") {
        id
        progressComplete {
          id
          sprints {
            id
          }
          challenges {
            id
          }
          sessions {
            id
          }
          cycles {
            id
          }
          programs {
            id
          }
          activities {
            id
          }
        }
      }
    }
  `)
    .then((result) => {
      console.log('Result of progress complete ', result);
      return result;
    });
};
