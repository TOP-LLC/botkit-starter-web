const lokkaClient = require('./../../lokka_graphcool.js');
const progressCurrent = require('./../queries/get_progress_current');
const getAllEvents = require('./../queries/get_all_events');
const debug = require('debug')('botkit:update_user_progressCurrent_onboarding');

module.exports = (userId) => {
  console.log('Set progressCurrent events to InProgress');

  const findEvents = async (ids) => {
    console.log('Running find events');
    const allEvents = await getAllEvents(userId);
    // Get first event that contains Program, then Cycle, then Session, then Sprint

    const program = allEvents.find(event => event.type === 'Program').id;
    const cycle = allEvents.find(event => event.type === 'Cycle').id;
    const session = allEvents.find(event => event.type === 'Session').id;
    const challenge = allEvents.find(event => event.type === 'Challenge').id;
    const sprint = allEvents.find(event => event.type === 'Sprint').id;

    // Return all events
    return [program, cycle, session, sprint, challenge];
  };

  const updateEvents = async allData =>
    allData.map((event) => {
      console.log('Updating event to InProgress', event);

      const mutationQuery = `{
        updateEvent (
          id: "${event}"
          status: InProgress
        ) {
          id
          type
          status
        }
      }
    `;

      return lokkaClient
        .mutate(mutationQuery)
        .then((result) => {
          debug('Updated event status', result);
          return { data: result };
        })
        .catch((error) => {
          debug('Error updating event status ', error);
          return { data: error };
        });
    });

  const updateProgressCurrentEvents = async () => {
    // Query for all progressCurrent ids
    const progressCurrentIds = await progressCurrent(userId);
    // Find events for given user with given ids
    const allEventData = await findEvents(progressCurrentIds);
    // Update all events to InProgress status
    await updateEvents(allEventData);
  };

  return updateProgressCurrentEvents()
    .then((data) => {
      console.log('Completed updating user progress and events ', data);
      return { data };
    })
    .catch((err) => {
      console.log('Error updating progress events current ', err);
      return { data: err };
    });
};
