import getProgressCurrent from './../components/graphcool/queries/get_progress_current.js';

const lokkaClient = require('./../components/lokka_graphcool.js');
const getProgressComplete = require('./../components/graphcool/queries/get_progress_complete.js');

// Refactor for serverless function
const createChallengeMetric = require('./../components/graphcool/mutations/create_challenge_metric.js');
const dateFormat = require('dateformat');
const _ = require('underscore');

module.exports = function (controller) {
  controller.hears(['challenge_metric_start'], ['message_received'], (bot, message) => {
    console.log('Executing challenge_metric_start');

    async function startTracking() {
      console.log('tracking async function start');

      try {
        const progressCurrent = await getProgressCurrent(message.user);
        const progressComplete = await getProgressComplete(message.user);
        const currentChallengeId = progressCurrent.User.progressCurrent.challenge
          ? progressCurrent.User.progressCurrent.challenge.id
          : null;
        console.log('current challenge ID ', currentChallengeId);
        const completedChallenge = progressComplete.User.progressComplete.challenges
          ? progressComplete.User.progressComplete.challenges.map(challenge => challenge.id)
          : null;
        console.log('Completed challenges ', completedChallenge);
        if (completedChallenge && completedChallenge.includes(currentChallengeId)) {
          return bot.say(
            {
              text: 'You have completed all of your current challenges. Well done! Your next challenge is coming soon!',
              channel: `${message.user}`,
            },
            (err, response) => {
              if (err) {
                return console.log('Error in bot say: ', err);
              }
              return false;
            },
          );
        }
        const formattedAttachment = await formatAttachment(progressCurrent);
        const object = {
          formattedAttachment,
          message,
        };
        return object;
      } catch (err) {
        return console.log('Error in the async chain is ', err);
      }
    }

    function formatAttachment(progressCurrent) {
      console.log('Query response from progressCurrent is ', JSON.stringify(progressCurrent));

      const challenge = progressCurrent.User.progressCurrent.challenge;

      const data = {
        challenge,
        id: challenge.id,
        type: challenge.type,
        title: challenge.title,
        challengeSubmission: challenge.activities[0],
        userId: progressCurrent.User.id,
      };

      return data;
    }

    return startTracking().then((result) => {
      if (!result) {
        return console.log('No attachment needed.');
      }
      const challenge = result.formattedAttachment;
      const challengeSubmission = result.formattedAttachment.challengeSubmission;
      const title = result.formattedAttachment.title;
      const userId = result.formattedAttachment.userId;

      bot.createConversation(message, (err, convo) => {
        if (err) {
          console.log('Error is: ', err);
        }

        const attachment = {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title,
                subtitle: challengeSubmission.text,
                default_action: {
                  type: 'web_url',
                  url: 'https://botkit-dev--advisor-rib-85356.netlify.com/train/',
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  fallback_url: 'https://botkit-dev--advisor-rib-85356.netlify.com/train/',
                },
                buttons: [
                  {
                    type: 'web_url',
                    url: 'https://botkit-dev--advisor-rib-85356.netlify.com/train/',
                    title: 'View Challenge',
                  },
                ],
              },
            ],
          },
        };

        convo.addMessage({
          text: 'Sweet! Let\'s get this challenge submitted!',
        });

        convo.addMessage({
          attachment,
          action: 'challenge_questions',
        });

        convo.addMessage(
          {
            text: 'Hmm, that doesn\'t look like an image file! Please only upload a jpg or png file.',
            action: 'challenge_questions',
          },
          'not_an_image_response',
        );

        convo.addMessage(
          {
            text: 'Sorry, I didn\'t understand that answer. Did you use any weird characters? Try again!.',
            action: 'challenge_questions',
          },
          'not_a_string_response',
        );

        convo.addMessage(
          {
            text: 'Then you aren\'t ready to submit your challenge! No worries, just come back when you are ready!.',
            action: 'stop',
          },
          'cancel_challenge_submission',
        );

        const answers = {};

        const newObject = _.object(challengeSubmission.questions, challengeSubmission.answerType);

        challengeSubmission.questions.map((question, index) => {
          // If value is a image, then use image pattern.
          // If value is a string, then use string pattern.

          if (newObject[question] === 'Image') {
            return convo.addQuestion(
              `${question}`,
              [
                {
                  default: true,
                  callback(response, convo) {
                    if (response.attachments !== null) {
                      if (response.attachments[0].type === 'image') {
                        console.log('Response type is ', JSON.stringify(response));
                        answers.upload = response.attachments[0].payload.url;
                        convo.next();
                      } else {
                        convo.say("Hmm, I don't recognize that image. Can you try again?");
                        convo.repeat();
                      }
                    }
                  },
                },
              ],
              { key: index },
              'challenge_questions',
            );
          } else if (newObject[question] === 'String') {
            return convo.addQuestion(
              `${question}`,
              [
                {
                  pattern: bot.utterances.yes,
                  callback(response, convo) {
                    answers[question] = response.text;
                    convo.next();
                  },
                },
                {
                  pattern: bot.utterances.no,
                  callback(response, convo) {
                    convo.gotoThread('cancel_challenge_submission');
                  },
                },
                {
                  default: true,
                  callback(response, convo) {
                    convo.say("Hmm, I didn't understand that. Did you use any weird characters? Try answering again!");
                    convo.repeat();
                    convo.next();
                    // convo.gotoThread('not_a_string_response')
                  },
                },
              ],
              { key: index },
              'challenge_questions',
            );
          }
          return convo.addMessage({
            text: 'I don\'t recognize that file. Make sure it\'s the correct file type for this challenge!',
            action: 'challenge_questions',
          });
        });

        convo.activate();

        convo.on('end', (convo) => {
          if (convo.successful()) {
            // this still works to send individual replies...
            bot.reply(
              message,
              'Great. You submitted your challenge! Your TOP trainer will review your challenge within 24 hours to see if everything looks good.',
            );

            return createChallengeMetric(userId, message.user, answers, challenge);
          }
        });
      });
    });
  });
};
