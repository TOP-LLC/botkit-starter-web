const lokkaClient = require('../../lokka_graphcool');
 module.exports = () => {
  console.log('Get next talk ');
   /*
    1. Get dates for the entire week (Monday - Friday)
    2. Query all Talks for the week
    3. Return each talk in an array
  */
   return lokkaClient
    .query(`
      {
        allTalks(filter: {status: PreLive} orderBy: date_ASC first: 3) {
          id
          status
          title
          type
          date
          seriesChallenge {
            id
            description
            dueDate
            current
          }
          series {
            id
            title
            description
          }
          trainer {
            id
            firstName
            lastName
          }
          attendees {
            id
            firstName
            lastName
          }
        }
      }    
    `)
    .then((result) => {
       console.log("Weekly Schedule query result is ", result.allTalks)
       return result.allTalks
     });
};