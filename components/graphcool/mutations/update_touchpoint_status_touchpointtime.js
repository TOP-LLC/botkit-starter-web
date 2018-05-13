const lokkaClient = require('./../../lokka_graphcool.js');
const debug = require('debug')('botkit:update_user_TouchpointStatus');

module.exports = (id) => {

    const updateTouchpointStatus = async () => {
        const mutationQuery = `($id: ID!) {
            updateTouchpointStatus (
              id: $id
              status: TouchpointTime
            ) {
              id
            }
          }
        `;
    
        const vars = {
         id,
        };
    
        return lokkaClient
          .mutate(mutationQuery, vars)
          .then((result) => {
            debug('Updated touchpointStatus', result);
            return { data: result };
          })
          .catch((error) => {
            debug('Error updating touchpointStatus ', error);
            return { error };
          });
      };
    
      return updateTouchpointStatus()
        .then((data) => {
          console.log('Completed updating user login notice to None ', data);
          return { data };
        })
        .catch((err) => {
          console.log('Error updating TouchpointStatus ', err);
          return { err };
        });

}