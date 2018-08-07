const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get PostLive Talk ');

  return lokkaClient
    .query(`
    {
        allTalks(filter: {status: PostLive}) {
          id
          date
          title
          type
          seriesChallenge {
            id
            current
          }
          series {
            id
            title
          }
        }
      }      
    `)
    .then((result) => result.allTalks);
}; 