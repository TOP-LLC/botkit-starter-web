const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_TouchpointStatus');

module.exports = (id, count) => {

    const updateTouchpointAppointment = async () => {
        const mutationQuery = `($id: ID!, $count: Int!) {
            updateTouchpointAppointment (
              id: $id
              reminder: $count
            ) {
              id
            }
          }
        `;
    
        const vars = {
         id,
         count: count + 1
        };
    
        return lokkaClient
          .mutate(mutationQuery, vars)
          .then((result) => {
            debug('Updated touchpointAppointment', result);
            return { data: result };
          })
          .catch((error) => {
            debug('Error updating touchpointAppointment ', error);
            return { error };
          });
      };
    
      return updateTouchpointAppointment()
        .then((data) => {
          console.log('Completed updating user login notice to None ', data);
          return { data };
        })
        .catch((err) => {
          console.log('Error updating TouchpointStatus ', err);
          return { err };
        });

}