const lokkaClient = require('./../../lokka_graphcool');

module.exports = (id) => {
  console.log('Run user query with ID ', id);

  return lokkaClient
  .query(`query{
    User (id: "${id}") {
      id        
      firstName
        lastName
        trainer {
          firstName
          lastName
        }
        touchpointStatus {
          status
          touchpointAppointment {
            id
            date
            status
          }
        }
        progressCurrent {
          cycle {
            id
            number
            positionId
            title
          }
          session {
            id
            number
            positionId
            title
          }
          sprint {
            id
            number
            positionId
            title
          }
          challenges {
            id
            positionId
            title
            type
          }
        }
      }
    }`).then((result) => {
    const userProfile = result.User;
    console.log('User status is ', userProfile);
    return userProfile;
  });

}