const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get next talk ');

  return lokkaClient
    .query(`
        query {
            allTalks (filter: {current: true}) {
            id
            status
            title 
            date 
            type
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