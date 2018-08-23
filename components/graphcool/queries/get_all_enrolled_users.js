const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {

  return lokkaClient
    .query(`
      query {
        allUsers(filter: { id: "cjelwqdx62gk10128w3c0gewe" }) {
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
    // .query(`
    //   query {
    //     allUsers(filter: {status: Active, type: Client, loginNotice: None phoneSMS_not: null}) {
    //       id
    //       firstName
    //       lastName
    //       phoneSMS
    //     }
    //   }      
    // `)
    .then((result) => result.allUsers);
};