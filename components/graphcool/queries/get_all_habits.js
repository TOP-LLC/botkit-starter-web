const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get all Habits ');

  return lokkaClient
    .query(`
        query {
            allHabits(filter: {active: false} orderBy: order_ASC) {
                id
                active
                message
                order
            }
      }
    `)
    .then((result) => result.allHabits);
}; 