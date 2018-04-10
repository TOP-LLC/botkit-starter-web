const lokkaClient = require('./../../lokka_graphcool.js');

module.exports = (userId) => {
  console.log('Running progressCurrent query with ID ', userId);

  // Query for Training Message
  return lokkaClient
    .query(`
    query {
      User (id: "${userId}") {
        id
        firstName
        lastName
        progressCurrent {
          challenge {
            id
            type
            title
            activities (filter: {type: ChallengeSubmission}) {
              id
              type
              title
              text
              url
              questions
              answerType
            }
          }
        }
      }
    }
  `)
    .then((result) => {
      console.log('Result of progress current ', result);
      return result;
    });
};
