const moment = require('moment-timezone');
const sgMail = require('@sendgrid/mail');

const greetings = ["What's up", 'Hey', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];
const randomNumber = Math.floor(Math.random() * greetings.length);
const greeting = greetings[randomNumber];

module.exports = async function(firstName, challengeMessage, challengeSet, currentChallenge, currentReminder) {

    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: 'support@topmortgage.org',
        subject: 'TOP mortgage training Daily Report',
        text: `${greeting} ${firstName}! ${challengeMessage ? 'You already submitted your challenge. Nice work!' : challengeSet}`,
        html: `<p>${greeting}, ${firstName}!</p> <p>${challengeMessage ? 'You already submitted your challenge. Nice work!</p>' : `Your challenge: "<em>${currentChallenge.description}</em>" is due ${moment.utc(currentChallenge.dueDate).fromNow()} <a href="mailto:support@topmortgage.org">Email us</a> to submit it.</p><p><strong>Today's challenge tip</strong>: ${currentReminder.message}</p>`}`,
      };
      sgMail.send(msg).then(message => console.log(message));
    } catch (err) {
      console.log("Error with sendGrid message", err)
      return err
    }
}
