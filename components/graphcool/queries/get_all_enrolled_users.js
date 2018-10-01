const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {

  return lokkaClient
    .query(`
    {
      allUsers(filter: {firstName_contains: "Cory" accountStatus_not: InActive, phoneSMS_not: null}) {
        id
        firstName
        lastName
        phoneSMS
        email
        attendedTalks {
          id
        }
        seriesChallengeSubmissions {
          id
          fileURL
          seriesChallenge {
            id
            current
          }
        }
      }
    }
    
      `)
    .then((result) => result.allUsers);
};