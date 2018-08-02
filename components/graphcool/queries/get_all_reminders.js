const lokkaClient = require('./../../lokka_graphcool');

module.exports = () => {
  console.log('Get all reminders ');

  return lokkaClient
    .query(`
        query {
            allReminders {
            id
            date
            message
            }
        }
    `)
    .then((result) => result.allReminders);
}; 