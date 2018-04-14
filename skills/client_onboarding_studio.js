/*

Triggers when progressCurrent is set to first Program/Cycle/Session/Sprint

*/
import getProgressCurrent from './../components/graphcool/queries/get_progress_current';
import updatePhoneSMS from './../components/graphcool/mutations/update_user_phone_number';

const debug = require('debug')('botkit:client_onboarding_studio');
const sendSMS = require('./../components/functions/sendSMS');

module.exports = (controller) => {
  controller.hears(['test_onboarding'], ['message_received'], (bot, message) => {
    debug('Heard onboarding');

    async function getUserData() {
      const progressCurrent = await getProgressCurrent(message.user);
      const { firstName, lastName } = progressCurrent.User;

      controller.studio
        .get(bot, 'New Client Onboarding', message.user, message.channel)
        .then((convo) => {
          convo.setVar('firstName', firstName);
          convo.setVar('lastName', lastName);

          // crucial! call convo.activate to set it in motion
          convo.activate();
        });
    }

    return getUserData()
      .then((result) => {
        debug('Started script', result);
        return result;
      })
      .catch(error => debug('Error: ', error));
  });

  controller.studio.before('New Client Onboarding', (convo, next) => {
    // do some preparation before the conversation starts...
    // for example, set variables to be used in the message templates
    // convo.setVar('foo','bar');
    debug('BEFORE: New Client Onboarding', convo);
    // don't forget to call next, or your conversation will never continue.
    next();
  });
  /* Validators */
  // Fire a function whenever a variable is set because of user input
  // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudiovalidate
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  // Validate user input: ready
  controller.studio.validate('New Client Onboarding', 'ready', (convo, next) => {
    const value = convo.extractResponse('ready');
    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation
    console.log('VALIDATE: New Client Onboarding VARIABLE: ready');
    // always call next!
    next();
  });
  // Validate user input: received_sms
  controller.studio.validate('New Client Onboarding', 'received_sms', (convo, next) => {
    const value = convo.extractResponse('received_sms');
    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation
    console.log('VALIDATE: New Client Onboarding VARIABLE: received_sms');
    // always call next!
    next();
  });
  // Validate user input: phone_number
  controller.studio.validate('New Client Onboarding', 'phone_number', (convo, next) => {
    const value = convo.extractResponse('phone_number');

    console.log('VALIDATE: New Client Onboarding VARIABLE: phone_number', value);

    value.replace(/[^\d]/g, '');

    debug('Phone formatted ', value);

    convo.setVar('phone', value);

    next();
  });
  // Validate user input: question_1
  controller.studio.validate('New Client Onboarding', 'question_1', (convo, next) => {
    const value = convo.extractResponse('question_1');
    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation
    console.log('VALIDATE: New Client Onboarding VARIABLE: question_1');
    // always call next!
    next();
  });
  // Validate user input: question_2
  controller.studio.validate('New Client Onboarding', 'question_2', (convo, next) => {
    const value = convo.extractResponse('question_2');
    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation
    console.log('VALIDATE: New Client Onboarding VARIABLE: question_2');
    // always call next!
    next();
  });
  // Validate user input: question_3
  controller.studio.validate('New Client Onboarding', 'question_3', (convo, next) => {
    const value = convo.extractResponse('question_3');
    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation
    console.log('VALIDATE: New Client Onboarding VARIABLE: question_3');
    // always call next!
    next();
  });

  // Before the default thread starts, run this:
  controller.studio.beforeThread('New Client Onboarding', 'default', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');
    console.log('In the script *New Client Onboarding*, about to start the thread *default*');
    // always call next!
    next();
  });
  // Before the on_timeout thread starts, run this:
  controller.studio.beforeThread('New Client Onboarding', 'on_timeout', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');
    console.log('In the script *New Client Onboarding*, about to start the thread *on_timeout*');
    // always call next!
    next();
  });
  // Before the bad_phone_number thread starts, run this:
  controller.studio.beforeThread('New Client Onboarding', 'bad_phone_number', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');
    console.log('In the script *New Client Onboarding*, about to start the thread *bad_phone_number*');
    // always call next!
    next();
  });
  // Before the reenter_phone_number thread starts, run this:
  controller.studio.beforeThread('New Client Onboarding', 'reenter_phone_number', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');
    console.log('In the script *New Client Onboarding*, about to start the thread *reenter_phone_number*');
    // always call next!
    next();
  });
  // Before the received_phone_number thread starts, run this:
  controller.studio.beforeThread(
    'New Client Onboarding',
    'received_phone_number',
    (convo, next) => {
      console.log(
        'In the script *New Client Onboarding*, about to start the thread *received_phone_number*',
        convo,
      );

      const smsMessage = {
        text: `Hey ${
          convo.vars.firstName
        }, thanks for setting up SMS messages for TOP mortgage training. You're good to go!`,
        channel: convo.context.user,
        continue_type: true,
        sent_timestamp: new Date(),
      };

      const { phone } = convo.vars;

      sendSMS(smsMessage, phone);

      next();
    },
  );
  // Before the failed_sms thread starts, run this:
  controller.studio.beforeThread('New Client Onboarding', 'failed_sms', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');
    console.log('In the script *New Client Onboarding*, about to start the thread *failed_sms*');
    // always call next!
    next();
  });
  // Before the success_sms thread starts, run this:
  controller.studio.beforeThread('New Client Onboarding', 'success_sms', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');
    console.log('In the script *New Client Onboarding*, about to start the thread *success_sms*');
    // always call next!
    next();
  });
  // define an after hook
  // you may define multiple after hooks. they will run in the order they are defined.
  // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudioafter
  controller.studio.after('New Client Onboarding', (convo, next) => {
    console.log('AFTER: New Client Onboarding');
    // handle the outcome of the convo
    if (convo.successful()) {
      const responses = convo.extractResponses();

      debug('responses are ', responses);

      debug('params are ', convo.context.user, convo.vars.phone);

      debug('params are type of ', typeof convo.context.user, typeof convo.vars.phone);

      updatePhoneSMS(convo.context.user, convo.vars.phone)
        .then((result) => {
          debug('Updated phone: ', result);
          return { data: result };
        })
        .catch((error) => {
          debug('Error updating phone: ', error);
        });

      // do something with the responses
    }

    // don't forget to call next, or your conversation will never properly complete.
    next();
  });
};
