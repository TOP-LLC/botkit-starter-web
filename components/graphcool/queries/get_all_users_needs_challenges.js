const lokkaClient = require('./../../lokka_graphcool')

module.exports = function () {

    return lokkaClient.query(`
    query {
        allProgressCurrents (filter: {user: {touchpointStatus: {status: NeedsChallenges}}}) {
          id
          sprint {
            id
            title
            number
          }
          sprintStart
          session {
            id
            title
            number
          }
          sessionStart
          cycle {
            id
            title
            number
          }
          cycleStart
          challenges {
            id
            title
            type
          }
        }
      }
    `).then(result => {
      return result.allProgressCurrents
    })
};