const debug = require('debug')('botkit:eventStart');

module.exports = async (event) => {
  debug('Find event type and return event data');

  // Creating random greeting

  const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up'];

  const randomNumber = Math.floor(Math.random() * greetings.length);

  const greeting = greetings[randomNumber];

  // Create attachment for start events

  const getEventType = () => {
    if (event.type === 'Program') {
      debug('Program matched');
      return 'Program';
    } else if (event.type === 'Cycle') {
      debug('Cycle matched');
      return 'Cycle';
    } else if (event.type === 'Session') {
      debug('Session matched');
      return 'Session';
    } else if (event.type === 'Sprint') {
      debug('Sprint matched');
      return 'Sprint';
    }
    return null;
  };

  const eventType = await getEventType();

  return {
    greeting,
    eventType,
    title: event[event.type.toLowerCase()].title,
    number: event[event.type.toLowerCase()].number,
  };
};
