const lokkaClient = require('./../../lokka_graphcool.js');

module.exports = (email) => {
    console.log('Running get user info from email ', email);

    // Query for Training Message
    return lokkaClient
        .query(`
        query ($email: String!){
            allUsers (filter: {email: $email}) {
              id
              submittedForm
              challengeMetrics {
                id
                status
                challenge {
                          id
                  type
                }
              }
            }
          }
  `, {email: email})
        .then((result) => {
            console.log("result of user info request is ", result)
            return {
                userId: result.allUsers[0].id,
                submittedForm: result.allUsers[0].submittedForm,
            }
        })
        .catch(err => {
            data: err
        });
};