const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get current Challenge ');

  return lokkaClient
    .query(`
        query {
            allSeriesChallenges (filter: {current: true}) {
                id
                description
                talk {
                    id
                    title
                }
            }
        }
    `)
    .then((result) => result.allSeriesChallenges[0]);
}; 