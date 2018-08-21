const schedule = require('node-schedule-tz');
 
const getAllHabits = require('../graphcool/queries/get_all_habits')
const getActiveHabit = require('../graphcool/queries/get_active_habit')

const updateActiveHabit = require('../graphcool/mutations/update_active_habit')
const updateNextHabit = require('../graphcool/mutations/update_next_habit') 

module.exports = async function() {

// Run every weekday morning at 10 am EST
// return schedule.scheduleJob('daily schedule', '0 6 * * 1-5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running Habit Update cron job at `, new Date())

  /*
    1. Get allHabits
    2. Set active habit to false and set random habit to true
  */

    try {
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
      console.log("Error with updating habit cron job ", err)
      return err
    }

// });

}
