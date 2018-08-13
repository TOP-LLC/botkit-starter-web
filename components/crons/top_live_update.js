const schedule = require('node-schedule-tz');

const getPostLiveTalk = require('./../graphcool/queries/get_postlive_talk')
const getNextTalk = require('./../graphcool/queries/get_next_prelive_talk')   
const getAllHabits = require('./../graphcool/queries/get_all_habits')
const getActiveHabit = require('./../graphcool/queries/get_active_habit')

const updateActiveHabit = require('./../graphcool/mutations/update_active_habit')
const updateNextHabit = require('./../graphcool/mutations/update_next_habit') 
const updatePostLiveChallenge = require('./../graphcool/mutations/update_postlive_challenge')
const updatePostLiveTalk = require('./../graphcool/mutations/update_postlive_talk')
const updatePreLiveChallenge = require('./../graphcool/mutations/update_prelive_challenge')
const updatePreLiveTalk = require('./../graphcool/mutations/update_prelive_talk')

module.exports = async function() {

// Run every weekday morning at 10 am EST
return schedule.scheduleJob('daily schedule', '0 6 * * *', 'Atlantic/Reykjavik', async function() {

  /*
    1. Get PostLive Talk and set current to false
    2. Get next PreLive Talk and set current to true
    3. If next PreLive Talk is a series, update challenge
      1. Update current Challenge to false
      2. Update next PreLive Talk Challenge to true
    4. Get allHabits
    5. Set active habit to false and set random habit to true
  */

    try {
      const postLiveTalk = await getPostLiveTalk()
      console.log("Post Live talk ", postLiveTalk)
      const updatedPostLiveTalk = await updatePostLiveTalk(postLiveTalk[0].id)
      console.log("Updated PostLive Talk ", updatedPostLiveTalk)
      const preLiveTalk = await getNextTalk()
      console.log("Pre Live Talk ", preLiveTalk)
      const updatedPreLiveTalk = await updatePreLiveTalk(preLiveTalk[0].id)
      if (updatedPreLiveTalk.data.type === 'Series') {
        const updatedPostLiveChallenge = await updatePostLiveChallenge(postLiveTalk[0].seriesChallenge.id)
        const updatedPreLiveChallenge = await updatePreLiveChallenge(preLiveTalk[0].seriesChallenge.id)
        console.log("Updated challenges ", [updatedPostLiveChallenge, updatedPreLiveChallenge])
      }
      const allHabits = await getAllHabits()
      console.log("All Habits ", allHabits)
      const activeHabit = await getActiveHabit()
      console.log("Active habit is ", activeHabit)
      const updatedActiveHabit = await updateActiveHabit(activeHabit.id)
      if (allHabits) {
        let index = activeHabit.order < allHabits.length - 1 ? activeHabit.order : 0
        console.log("Index is ", index)
        let nextHabit = allHabits[index].id
        const updatedNextHabit = await updateNextHabit(nextHabit)
        console.log("Updated Next Habit ", updatedNextHabit)
      }
      return updatedActiveHabit
    } catch (err) {
      console.log("Error with nightly cron job ", err)
      return err
    }

});

}
