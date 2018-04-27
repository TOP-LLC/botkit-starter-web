const lokkaClient = require('./../../lokka_graphcool');

module.exports = (id) => {
  console.log('Run user query with ID ', id);

  return lokkaClient
    .query(`
      query {
        User(id: "${id}") {
          id
          psid
          type
          convoPause
          gender
          status
          bootCamps {
            id
            location
            registered
            seats
            title
            date
            users {
              id
            }
          }
          requestedBootCamps
          accountStatus
          email
          fbPicture
          firstName
          lastName
          locale
          invitation
        }
      }
    `)
    .then((result) => {
      const userProfile = result.User;
      console.log('User profile data is ', userProfile);
      return userProfile;
    });
};
