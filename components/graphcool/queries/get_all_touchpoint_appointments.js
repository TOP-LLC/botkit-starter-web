const lokkaClient = require('./../../lokka_graphcool')

module.exports = function () {

    return lokkaClient.query(`
    {
      allTouchpointAppointments(filter: {OR: [
        {client: {id_not: null} status_not: Cancelled},
        {client: {id_not: null} status_not: Rejected},
        {client: {id_not: null} status_not: Rescheduled},
        {client: {id_not: null} status_not: Approved}
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
