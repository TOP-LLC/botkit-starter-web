const debug = require('debug')('botkit:sendSMS');
const rp = require('request-promise');

module.exports = (message, phone) => {
  debug('Running handleSMS');

  const options = {
    method: 'POST',
    uri: 'http://borilabs.com/textline/send-email.php',
    formData: {
      message: message.text,
      phone,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  rp
    .post(options)
    .then((response) => {
      // handle success
      debug('Ran handleSMS ', JSON.stringify(response));
      return { data: response };
    })
    .catch((error) => {
      // handle error
      debug('error in handleSMS ', error);
      return { data: error };
    });
};
