/*
Query for all published sprints for T1 Program
Query for startDate for team schedule (or calculate startDate based on next Tuesday > 3 days away)
Based on numerical order, calculate total number of sprints in array
Calculate the dates for every Monday and Thursday based on length of sprints array
Put all values into an array
For every sprint key, assign first array value as value until end
Run createEvent mutation . . .
  for every key:value pair, create a new event of type Sprint
Add each event to Schedule with updateSchedule mutation

*/
const schedule = require('node-schedule')
const _ = require('underscore')
const rp = require('request-promise');
const later = require("later")
const lokkaClient = require("./../lokka_graphcool.js")
const _ = require("lodash")

module.exports = async function () {

    return schedule.scheduleJob('0 1 1 * 0', function() {

	console.log("Start create all Touchpoint Appointments")

		later.date.UTC()

		// Trainer Constants

		const brianSlots = [
			later.parse.text("at 10:15 pm every weekday"),
			later.parse.text("at 20:00 pm every Monday and Thursday")
		]

		const samSlots = [
			later.parse.text("at 12:00 am every weekday"), 
			later.parse.text("at 12:30 am every weekday"), 
			later.parse.text("at 24:00 pm every weekday"), 
			later.parse.text("at 00:30 pm every weekday")
		]
		
		const johnSlots = [
			later.parse.text("at 18:00 pm every weekday"),
			later.parse.text("at 18:30 pm every weekday")
		]

		// Create schedule for each Trainer

		const brianSchedule = brianSlots.map(apt => {
			return later.schedule(apt).next(20)
		})

		console.log("Brian's schedule is ", brianSchedule)

		const samSchedule = samSlots.map(apt => {
			return later.schedule(apt).next(20)
		})

		console.log("Sam's schedule is ", samSchedule)

		const johnSchedule = johnSlots.map(apt => {
			return later.schedule(apt).next(20)
		})

		console.log("John's schedule is ", johnSchedule)

		// Create Brian's Touchpoint Appointments

		let trainerData = [
			{"name": "Brian", "trainer": "cjggoqu9vr56i0107ogg3xgxm", "schedule": _.flattenDeep(brianSchedule)},
			{"name": "Sam", "trainer": "cjggoreedr5dm0107sza9kv4s", "schedule": _.flattenDeep(samSchedule)},
			{"name": "John", "trainer": "cjggor5431fpn01308qrajp33", "schedule": _.flattenDeep(johnSchedule)},
		]

		let allTouchpointAppointments = () => { 
			
			trainerData.map(data => {

			console.log("Data is ", data)

			data.schedule.map(date => {

				console.log("Date is ", date)

				const mutationQuery = `($date: DateTime!) {
					createTouchpointAppointment (
						date: $date
						status: null
					) {
						id
						date
					}
				}
				`
	
				const vars = {
					"date": date
				}
	
				return lokkaClient.mutate(mutationQuery, vars).then(result => {	
	
					const tpId = result.createTouchpointAppointment.id
	
					const mutationQuery2 = `($trainer: ID!, $tpId: ID!) {
						addToTouchpointAppointmentOnTrainer (
							trainerTrainerId: $trainer
							touchpointAppointmentsTouchpointAppointmentId: $tpId
						) {
							trainerTrainer {
								id
								firstName
							}
							touchpointAppointmentsTouchpointAppointment {
								id
								date
							}
						}
					}
					`
		
					const vars2 = {
						"trainer": data.trainer,
						"tpId": tpId
					}
	
					return lokkaClient.mutate(mutationQuery2, vars2).then(result => { 
						return console.log(JSON.stringify(result))
					})
				})		
			})
		})
	}

		try {
			let completed = await allTouchpointAppointments()
			console.log("Completed is ", completed)
			return console.log("Finished creating monthly touchpoint appointments")
		} catch (err) {
			return console.log("Error was ", err)
		}
    })
}
