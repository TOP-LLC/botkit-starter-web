const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get current Habit ');

  return lokkaClient
    .query(`
        query {
            allHabits (filter: {active: true}) {
                id
                active
                message
            }
        }
    `)
    .then((result) => result.allHabits[0]);
}; 