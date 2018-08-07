const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get Next PreLive Talk ');

  return lokkaClient
    .query(`
    {
      allTalks(filter: {status: PreLive} orderBy: date_DESC first: 1) {
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