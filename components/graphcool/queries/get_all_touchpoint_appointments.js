const lokkaClient = require('./../../lokka_graphcool')

module.exports = function () {

    return lokkaClient.query(`
    {
      allTouchpointAppointments(filter: {AND: [
        {client: {id_not: null}},
        {OR: [{status: null}, {status: Accepted}, {status: Pending}]}
      ]}) {
        id
        date
        status
        reminder
        trainer {
          id
          firstName
          lastName
          phone
          userId {
            id
            phoneSMS
          }
        }
        client {
          id
          firstName
          lastName
          touchpointStatus {
            id
          }
        }
      }
    }
    
    `).then(result => {
      return result.allTouchpointAppointments
    })
};
