import getProgressCurrent from './../components/graphcool/queries/get_progress_current';
import getProgressComplete from './../components/graphcool/queries/get_progress_complete';

const debug = require('debug')('botkit:challenge_metric_submission_start_studio');

// Determine what kind of challenge progressCurrent is. Start corresponding studio script for that challenge type.

module.exports = (controller) => {
  controller.hears(['challenge_metric_submission_start'], ['message_received'], (bot, message) => {
    // format all variables for conversation
    function formatAttachment(progressCurrent) {
      console.log('Query response from progressCurrent is ', JSON.stringify(progressCurrent));

      const { challenge } = progressCurrent.User.progressCurrent;

      const data = {
        challenge,
        id: challenge.id,
        type: challenge.type,
        title: challenge.title,
        challengeActivity: challenge.activities,
        userId: progressCurrent.User.id,
      };

      return data;
    }

    // Get user progress complete and current data for challenge

    async function getAllChallenges() {
      console.log('GetAllChallenges start');

      try {
        const progressCurrent = await getProgressCurrent(message.user);
        const progressComplete = await getProgressComplete(message.user);
        const { firstName, lastName } = progressCurrent.User;
        const currentChallengeId = progressCurrent.User.progressCurrent.challenge
          ? progressCurrent.User.progressCurrent.challenge.id
          : null;
        console.log('current challenge ID ', currentChallengeId);
        const completedChallenge = progressComplete.User.progressComplete.challenges
          ? progressComplete.User.progressComplete.challenges.map(challenge => challenge.id)
          : null;
        console.log('Completed challenges ', completedChallenge);
        if (completedChallenge && completedChallenge.includes(currentChallengeId)) {
          debug('Starting completed thread');
          //   Start completed thread

          controller.studio
            .get(bot, 'challenges_complete', message.user, message.channel)
            .then((convo) => {
              convo.setVar('firstName', firstName);
              convo.setVar('lastName', lastName);

              // crucial! call convo.activate to set it in motion
              convo.activate();
            });
        }
        // Start challenge submission thread

        debug('starting challenge submission thread');
        try {
          const challengeData = await formatAttachment(progressCurrent);

          debug('challengeData is ', challengeData);

          return controller.studio
            .get(bot, `challenge_metric_${challengeData.type}_start`, message.user, message.channel)
            .then((convo) => {
              convo.setVar('firstName', firstName);
              convo.setVar('lastName', lastName);
              convo.setVar('title', challengeData.title);
              convo.setVar('type', challengeData.type);
              convo.setVar('text', challengeData.challengeActivity[0].text);
              convo.setVar('userId', challengeData.userId);
              convo.setVar('challenge', challengeData.challenge);

              // crucial! call convo.activate to set it in motion
              convo.activate();
            })
            .catch(error => debug('error!!', error));
        } catch (err) {
          debug('Error in challengeData ', err);
        }
      } catch (err) {
        debug('Error in the async chain is ', err);
      }
    }

    console.log('Executing challenge_metric_submission_start');

    return getAllChallenges()
      .then((result) => {
        console.log('Finished running all challenges script', result);
        return result;
      })
      .catch((error) => {
        debug('error at getAllChallenges: ', error);
      });
  });

  /* Validators */
  // Fire a function whenever a variable is set because of user input
  // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudiovalidate
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  // Validate user input: string_question_1
  controller.studio.validate('challenge_metric_submission_start', 'string_question_1', (convo, next) => {
    const value = convo.extractResponse('string_question_1');

    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation

    console.log('VALIDATE: challenge_metric_submission_start VARIABLE: string_question_1');

    // always call next!
    next();
  });

  // Validate user input: string_question_2
  controller.studio.validate('challenge_metric_submission_start', 'string_question_2', (convo, next) => {
    const value = convo.extractResponse('string_question_2');

    if (value.attachments !== null) {
      if (value.attachments[0].type === 'image') {
        console.log('Response type is ', JSON.stringify(response));
        answers.upload = response.attachments[0].payload.url;
        convo.next();
      } else {
        convo.say("Hmm, I don't recognize that image. Can you try again?");
        convo.repeat();
      }
    }

    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation

    console.log('VALIDATE: challenge_metric_submission_start VARIABLE: string_question_2');

    // always call next!
    next();
  });

  // Validate user input: image_question_1
  controller.studio.validate('challenge_metric_submission_start', 'image_question_1', (convo, next) => {
    const value = convo.extractResponse('image_question_1');

    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation

    console.log('VALIDATE: challenge_metric_submission_start VARIABLE: image_question_1');

    // always call next!
    next();
  });

  // Validate user input: challenge_accept
  controller.studio.validate('challenge_metric_submission_start', 'challenge_accept', (convo, next) => {
    console.log('Validating challenge_accept');
    const value = convo.extractResponse('challenge_accept');
    const { answerType } = convo.vars.challenge.activities[0];

    if (answerType[0] === 'String') {
      convo.setVar('question1', convo.vars.challenge.activities[0].questions[0]);
      return convo.gotoThread('string_challenge_type');
    } else if (answerType[1] === 'Image') {
      return convo.gotoThread('image_challenge_type');
    }
    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation

    console.log('VALIDATE: challenge_metric_submission_start VARIABLE: challenge_accept');

    // always call next!
    next();
  });

  // Validate user input: question_1
  controller.studio.validate('challenge_metric_submission_start', 'question_1', (convo, next) => {
    const value = convo.extractResponse('question_1');

    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation

    console.log('VALIDATE: challenge_metric_submission_start VARIABLE: question_1');

    // always call next!
    next();
  });

  // Validate user input: question_2
  controller.studio.validate('challenge_metric_submission_start', 'question_2', (convo, next) => {
    const value = convo.extractResponse('question_2');

    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation

    console.log('VALIDATE: challenge_metric_submission_start VARIABLE: question_2');

    // always call next!
    next();
  });

  // Validate user input: question_3
  controller.studio.validate('challenge_metric_submission_start', 'question_3', (convo, next) => {
    const value = convo.extractResponse('question_3');

    // test or validate value somehow
    // can call convo.gotoThread() to change direction of conversation

    console.log('VALIDATE: challenge_metric_submission_start VARIABLE: question_3');

    // always call next!
    next();
  });

  /* Thread Hooks */
  // Hook functions in-between threads with beforeThread
  // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudiobeforethread
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  // Before the default thread starts, run this:
  controller.studio.beforeThread('challenge_metric_submission_start', 'default', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');

    console.log('In the script *challenge_metric_submission_start*, about to start the thread *default*');

    // always call next!
    next();
  });

  // Before the all_challenges_completed thread starts, run this:
  controller.studio.beforeThread(
    'challenge_metric_submission_start',
    'all_challenges_completed',
    (convo, next) => {
      // / do something fun and useful
      // convo.setVar('name','value');

      console.log('In the script *challenge_metric_submission_start*, about to start the thread *all_challenges_completed*');

      // always call next!
      next();
    },
  );

  // Before the changed_mind thread starts, run this:
  controller.studio.beforeThread('challenge_metric_submission_start', 'changed_mind', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');

    console.log('In the script *challenge_metric_submission_start*, about to start the thread *changed_mind*');

    // always call next!
    next();
  });

  // Before the image_challenge_type thread starts, run this:
  controller.studio.beforeThread(
    'challenge_metric_submission_start',
    'image_challenge_type',
    (convo, next) => {
      // / do something fun and useful
      // convo.setVar('name','value');

      console.log('In the script *challenge_metric_submission_start*, about to start the thread *image_challenge_type*');

      // always call next!
      next();
    },
  );

  // Before the image_challenge_not_matched thread starts, run this:
  controller.studio.beforeThread(
    'challenge_metric_submission_start',
    'image_challenge_not_matched',
    (convo, next) => {
      // / do something fun and useful
      // convo.setVar('name','value');

      console.log('In the script *challenge_metric_submission_start*, about to start the thread *image_challenge_not_matched*');

      // always call next!
      next();
    },
  );

  // Before the string_challenge_type thread starts, run this:
  controller.studio.beforeThread(
    'challenge_metric_submission_start',
    'string_challenge_type',
    (convo, next) => {
      // / do something fun and useful
      // convo.setVar('name','value');

      console.log('In the script *challenge_metric_submission_start*, about to start the thread *string_challenge_type*');

      // always call next!
      next();
    },
  );

  // Before the string_challenge_not_matched thread starts, run this:
  controller.studio.beforeThread(
    'challenge_metric_submission_start',
    'string_challenge_not_matched',
    (convo, next) => {
      // / do something fun and useful
      // convo.setVar('name','value');

      console.log('In the script *challenge_metric_submission_start*, about to start the thread *string_challenge_not_matched*');

      // always call next!
      next();
    },
  );

  // Before the challenge_submitted thread starts, run this:
  controller.studio.beforeThread('challenge_metric_submission_start', 'challenge_submitted', (convo, next) => {
    // / do something fun and useful
    // convo.setVar('name','value');

    console.log('In the script *challenge_metric_submission_start*, about to start the thread *challenge_submitted*');

    // always call next!
    next();
  });

  // define an after hook
  // you may define multiple after hooks. they will run in the order they are defined.
  // See: https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#controllerstudioafter
  controller.studio.after('challenge_metric_submission_start', (convo, next) => {
    console.log('AFTER: challenge_metric_submission_start');

    // handle the outcome of the convo
    if (convo.successful()) {
      const responses = convo.extractResponses();
      // do something with the responses
    }

    // don't forget to call next, or your conversation will never properly complete.
    next();
  });
};
