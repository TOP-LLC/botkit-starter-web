const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get most recent Talk ');

  return lokkaClient
    .query(`
        query {
        allTalks (filter: {status: Past} orderBy: date_DESC first: 1) {
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
    .then((result) => result.allTalks[0]);
}; 