import trainingEventStart from "./../functions/trainingEventStart"

const sendSMS = require("./../functions/twilioSMS")
const rp = require("request-promise")
const moment = require("moment")
const queryUser = require("./../graphcool/queries/get_user_info")
const updateUserConvoPause = require("./../graphcool/queries/update_user_convo_pause")
const updateTouchpointStatus = require("./../graphcool/mutations/update_touchpoint_status_touchpointtime")
const updateTouchpointAppointment = require("./../graphcool/mutations/update_touchpoint_appointment_reminder")
const updateUserStatus = require("./../graphcool/mutations/update_user_submittedForm")
const getUserId = require("./../graphcool/queries/get_user_from_email")
const randomGreeting = require("./../functions/randomGreeting")
const debug = require("debug")("botkit:incoming_webhooks")

module.exports = (webserver, controller) => {
  debug("Configured /botkit/receive url")
  webserver.post("/botkit/receive", (req, res) => {
    // respond to Slack that the webhook has been received.
    res.status(200)
    res.send("Got Botkit Message")

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res)
  })

  debug("Configured POSt /dashbotpause url for pausing bot for live takeover")
  webserver.post("/dashbotpause", (req, res) => {
    console.log("Received webhook for bot pausing")

    const { paused, userId } = req.body

    async function setConvoPause(code, state) {
      console.log("get user id started")

      try {
        const user = await queryUser(userId)
        console.log("User ID is ", user.id)
        const result = await updateUserConvoPause(user.id, paused)
        console.log("Result of updateUserConvoPause is ", result)
        return result
      } catch (err) {
        return console.log("Error in the async chain is ", err)
      }
    }

    console.log("Paused state and userId here: ", [paused, userId])

    return setConvoPause().then(result => {
      console.log("Completed user convo pause ", result)
      res.status(200)
      res.send("Dashbot Pause Ran")
    })
  })

  // Trigger when client completes a Google Form
  debug("Configured /submitform url")
  webserver.post("/submitform", async (req, res) => {
    debug("Running Google form submitted endpoint", req)

    const { email } = req.headers

    console.log("Email is ", email)

    if (email) {
      const message = {
        text: email
      }
      sendSMS(message, '9517647045')
      try {
        const userData = await getUserId(email)
        const updatedStatus = await updateUserStatus(userData.userId, userData.submittedForm)
        console.log("Updated user data is ", updatedStatus)
      } catch (err) {
        console.log("Got an error in updating user submittedForm ", err)
        return {data: err}
      }
    } else {
      res.status(200)
      res.end("No email found, ignoring or error")
    }

    res.status(200)

    res.end(`Email received is ${email}`)
  })

  debug("Configured /sprintreminder url")
  webserver.post("/sprintreminder", async (req, res) => {
    debug("Running sprint reminder", JSON.stringify(req.body))

    const { progressCurrent } = req.body

    const { sprint, session, cycle, sprintStart } = progressCurrent

    const formattedDate = moment(sprintStart).fromNow()

    const user = progressCurrent.user
    
    const greeting = randomGreeting()

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "Sprint Reminder", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("sprintTitle", sprint.title)
        convo.setVar("sprintNumber", sprint.number)
        convo.setVar("sessionTitle", session.title)
        convo.setVar("sessionNumber", session.number)
        convo.setVar("cycleTitle", cycle.title)
        convo.setVar("cycleNumber", cycle.number)
        convo.setVar("startDate", formattedDate)
        convo.setVar("sprintDuration", sprint.duration)
        convo.setVar("greeting", greeting)
                
        convo.activate()
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /onboarstart url")
  webserver.post("/onboardstart", (req, res) => {
    debug("Running onboarding start", JSON.stringify(req.body))

    const { user } = req.body

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "New Client Onboarding", user.id, `Bot-${user.id}`)
      .then(convo => {
        // crucial! call convo.activate to set it in motion
        convo.setVar("firstName", user.firstName)

        convo.activate()
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /touchpointneedsbooked url")
  webserver.post("/touchpointneedsbooked", async (req, res) => {
    debug("Running touchpoint needs booked event start", JSON.stringify(req.body))

    const { user } = req.body.data.TouchpointStatus.node

    const touchpointStatus = req.body.data.TouchpointStatus.node

    let status = null

    if (touchpointStatus.touchpointAppointment) {
      let { touchpointAppointment: {id, status} } = touchpointStatus
      console.log("Status ", status)
    }

    const { number, title } = touchpointStatus.user.progressCurrent.session

    const bot = controller.spawn({})

    // If Cancelled

    if (status === "Cancelled") {
      controller.studio
      .get(
        bot,
        "Touchpoint Appointment Needs Rescheduled",
        user.id,
        `Bot-${user.id}`
      )
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("greeting", "Boom")

        convo.activate()
      })

    res.status(200)

    return res.end("Got it!")
    }

    // If not cancelled

    controller.studio
      .get(
        bot,
        "Touchpoint Appointment Needs Booked",
        user.id,
        `Bot-${user.id}`
      )
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("greeting", "Boom")
        convo.setVar("number", number)
        convo.setVar("title", title)

        convo.activate()
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /touchpointneedsrescheduled url")
  webserver.post("/touchpointneedsrescheduled", async (req, res) => {
    debug("Running touchpoint needs rescheduled event start", JSON.stringify(req.body))

    const { user } = req.body.data.TouchpointStatus.node

    const touchpointStatus = req.body.data.TouchpointStatus.node

    let status = null

    if (touchpointStatus.touchpointAppointment) {
      let { touchpointAppointment: {id, status} } = touchpointStatus
      console.log("Status ", status)
    }

    const { number, title } = touchpointStatus.user.progressCurrent.session

    const bot = controller.spawn({})

      controller.studio
      .get(
        bot,
        "Touchpoint Appointment Needs Rescheduled",
        user.id,
        `Bot-${user.id}`
      )
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("greeting", "Boom")

        convo.activate()
      })

    res.status(200)

    res.end("Got it!")
  })

  
  debug("Configured /touchpointreview url")
  webserver.post("/touchpointreview", async (req, res) => {
    debug("Running touchpoint review function", JSON.stringify(req.body))

    const { user } = req.body.data.TouchpointStatus.node

    const touchpointStatus = req.body.data.TouchpointStatus.node

    const { number, title } = touchpointStatus.user.progressCurrent.session

    const phone = touchpointStatus.user.trainer.userId.phoneSMS

    const trainer = touchpointStatus.user.trainer.userId

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "Touchpoint Review Requested", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("greeting", "Boom")
        convo.setVar("number", number)
        convo.setVar("title", title)

        convo.activate()
      })

    // Send text to Trainer
    const message = {
      text: `Hey ${trainer.firstName}! ${user.firstName} ${
        user.lastName
      } has some submitted challenges that need your review! Check out their client page to Pass or Reject them.`
    }
    sendSMS(message, phone)

    const options = {
      method: "POST",
      uri: "https://hooks.zapier.com/hooks/catch/2208592/fn4tvp/",
      body: {
        message: message.text
      },
      json: true
    }

    return rp
      .post(options)
      .then(response => {
        // handle success
        console.log("Ran Zapier SMS ", JSON.stringify(response))
        return response
      })
      .catch(err => {
        // handle error
        console.log("error in Zapier SMS ", err)
        return err
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /touchpointbooked url")
  webserver.post("/touchpointbooked", async (req, res) => {
    debug("Running touchpoint is booked", JSON.stringify(req.body))

    const { user } = req.body.data.TouchpointStatus.node

    const touchpointStatus = req.body.data.TouchpointStatus.node

    const { number, title } = touchpointStatus.user.progressCurrent.session

    const phone = touchpointStatus.user.trainer.userId.phoneSMS

    const trainer = touchpointStatus.user.trainer.userId

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "Touchpoint Appointment Booked", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("greeting", "Boom")
        convo.setVar("number", number)
        convo.setVar("title", title)

        convo.activate()
      })

    // Send text to Trainer
    const message = {
      text: `Heads up, ${trainer.firstName}! ${user.firstName} ${
        user.lastName
      } just booked their Touchpoint with you. Log in to verify the time!`
    }
    sendSMS(message, phone)

    const options = {
      method: "POST",
      uri: "https://hooks.zapier.com/hooks/catch/2208592/fn4tvp/",
      body: {
        message: message.text
      },
      json: true
    }

    return rp
      .post(options)
      .then(response => {
        // handle success
        console.log("Ran Zapier SMS ", JSON.stringify(response))
        return response
      })
      .catch(err => {
        // handle error
        console.log("error in Zapier SMS ", err)
        return err
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /touchpointaccepted url")
  webserver.post("/touchpointaccepted", async (req, res) => {
    debug("Running touchpoint is accepted", JSON.stringify(req.body))

    const user = req.body.data.TouchpointAppointment.node.client

    const touchpointAppointment = req.body.data.TouchpointAppointment.node

    const phone = touchpointAppointment.client.trainer.userId.phoneSMS

    const trainer = touchpointAppointment.client.trainer.userId

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "Touchpoint Appointment Accepted", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("greeting", "Boom")

        convo.activate()
      })

    // Send text to Trainer
    const message = {
      text: `Hey ${trainer.firstName}! ${user.firstName} ${
        user.lastName
      }'s Touchpoint appointment has been confirmed. You're good to go!`
    }
    sendSMS(message, phone)

    const options = {
      method: "POST",
      uri: "https://hooks.zapier.com/hooks/catch/2208592/fn4tvp/",
      body: {
        message: message.text
      },
      json: true
    }

    return rp
      .post(options)
      .then(response => {
        // handle success
        console.log("Ran Zapier SMS ", JSON.stringify(response))
        return response
      })
      .catch(err => {
        // handle error
        console.log("error in Zapier SMS ", err)
        return err
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /touchpointreminder url")
  webserver.post("/touchpointreminder", async (req, res) => {
    debug("Running touchpoint reminder", JSON.stringify(req.body))

    
    const { touchPoint } = req.body

    const user = touchPoint.client

    const phone = touchPoint.trainer.phone

    const { trainer } = touchPoint

    const count = touchPoint.reminder

    let updatedStatus = await updateTouchpointAppointment(touchPoint.id, count)

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "Touchpoint Appointment Hour Reminder", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("trainer", trainer.firstName)

        convo.activate()
      })

    // Send text to Trainer
    const message = {
      text: `Hey ${trainer.firstName}! This is a reminder that you have a Touchpoint with ${user.firstName} ${
        user.lastName
      } in one hour. Log into the client page to review their material and start the call when you're ready.`
    }
    sendSMS(message, phone)

    const options = {
      method: "POST",
      uri: "https://hooks.zapier.com/hooks/catch/2208592/fn4tvp/",
      body: {
        message: message.text
      },
      json: true
    }

    return rp
      .post(options)
      .then(response => {
        // handle success
        console.log("Ran Zapier SMS ", JSON.stringify(response))
        return response
      })
      .catch(err => {
        // handle error
        console.log("error in Zapier SMS ", err)
        return err
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /touchpointtime url")
  webserver.post("/touchpointtime", async (req, res) => {
    debug("Running touchpoint time", JSON.stringify(req.body))

    try {

    const { touchPoint } = req.body

    const user = touchPoint.client

    const phone = touchPoint.trainer.phone

    const { trainer } = touchPoint

    const count = touchPoint.reminder

    let updatedStat = await updateTouchpointAppointment(touchPoint.id, count)
    let updatedStatus = await updateTouchpointStatus(user.touchpointStatus.id)

    debug("Updated touchpoint status is ", updatedStatus)

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "Touchpoint Appointment 10 Minute Reminder", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("trainer", trainer.firstName)

        convo.activate()
      })

    // Send text to Trainer
    const message = {
      text: `Hey ${trainer.firstName}! Your Touchpoint with ${user.firstName} ${
        user.lastName
      } starts in 10 minutes. Log into the client page to review their material and start the call when you're ready.`
    }

    sendSMS(message, phone)

    const options = {
      method: "POST",
      uri: "https://hooks.zapier.com/hooks/catch/2208592/fn4tvp/",
      body: {
        message: message.text
      },
      json: true
    }

      rp
      .post(options)
      .then(response => {
        // handle success
        console.log("Ran Zapier SMS ", JSON.stringify(response))
        return response
      })
      .catch(err => {
        // handle error
        console.log("error in Zapier SMS ", err)
        return err
      })

    res.status(200)

    res.end("Got it!")

    } catch (err) {
      console.log("Error is IN THIS FUNCTION ", err)
    }

  })

  debug("Configured /trainingeventstart url")
  webserver.post("/trainingeventstart", async (req, res) => {
    debug("Running event start", JSON.stringify(req.body))

    const { schedule } = req.body.data.Event.node

    const event = req.body.data.Event.node

    const eventRes = await trainingEventStart(event)
    debug("Returned event data: ", eventRes)
    const { eventType, greeting, title, number } = eventRes

    const { user } = schedule

    const bot = controller.spawn({})

    const url = "/train/current"

    controller.studio
      .get(bot, "New Training Event Start", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("type", eventType)
        convo.setVar("greeting", greeting)
        convo.setVar("title", title)
        convo.setVar("number", number)
        convo.setVar("url", url)

        convo.activate()
      })

    res.status(200)
    res.end("Got it!")
  })

  // Client submits a challenge for review
  debug("Configured /challengesubmit url")
  webserver.post("/challengesubmit", (req, res) => {
    // Challenge will either be intermittent or touchpoint. If Touchpoint, check if all challenges for given session are complete.

    debug("Received: ", JSON.stringify(req.body))

    const {
      type,
      title,
      session,
      challengeCriteria,
      activities,
      reviewType
    } = req.body.data.ChallengeMetric.node.challenge
    const { id, firstName, lastName } = req.body.data.ChallengeMetric.node.user

    if (reviewType === "Touchpoint") {
      if (type === "Submission") {
        // Trigger bot convo for asking questions

        debug("Challenge is a Submission")

        const bot = controller.spawn({})

        controller.studio
          .get(
            bot,
            `challenge_metric_${type.toLowerCase()}_start`,
            id,
            `Bot-${id}`
          )
          .then(convo => {
            convo.setVar("firstName", firstName)
            convo.setVar("lastName", lastName)
            convo.setVar("title", title)
            convo.setVar("type", type)
            convo.setVar("text", activities[0].text)
            convo.setVar("userId", id)

            // crucial! call convo.activate to set it in motion
            convo.activate()
          })

        // Trigger bot convo if this is only one of many challenges remaining to be completed
      } else {
        // Trigger bot convo for confirming submission

        debug("Challenge is not a submission")

        const bot = controller.spawn({})

        controller.studio
          .get(bot, "challenge_metric_received", id, `Bot-${id}`)
          .then(convo => {
            convo.setVar("firstName", firstName)
            convo.setVar("lastName", lastName)
            convo.setVar("title", title)
            convo.setVar("type", type)
            convo.setVar("userId", id)
            convo.setVar("sessionTitle", session.title)
            convo.setVar("sessionNumber", session.number)

            // crucial! call convo.activate to set it in motion
            convo.activate()
          })
      }
    } else if (type === "Submission") {
      // Trigger bot convo for asking questions

      debug("Challenge is a Submission")

      const bot = controller.spawn({})

      controller.studio
        .get(
          bot,
          `challenge_metric_${type.toLowerCase()}_incremental_start`,
          id,
          `Bot-${id}`
        )
        .then(convo => {
          convo.setVar("firstName", firstName)
          convo.setVar("lastName", lastName)
          convo.setVar("title", title)
          convo.setVar("type", type)
          convo.setVar("text", activities[0].text)
          convo.setVar("userId", id)

          // crucial! call convo.activate to set it in motion
          convo.activate()
        })

      // Trigger bot convo if this is only one of many challenges remaining to be completed
    } else {
      // Trigger bot convo for confirming submission

      debug("Challenge is not a submission")

      const bot = controller.spawn({})

      controller.studio
        .get(bot, "challenge_metric_incremental_received", id, `Bot-${id}`)
        .then(convo => {
          convo.setVar("firstName", firstName)
          convo.setVar("lastName", lastName)
          convo.setVar("title", title)
          convo.setVar("type", type)
          convo.setVar("userId", id)
          convo.setVar("sessionTitle", session.title)
          convo.setVar("sessionNumber", session.number)

          // crucial! call convo.activate to set it in motion
          convo.activate()
        })
    }

    res.status(200)
    res.end("OK")

    // Now, pass the webhook into be processed
    // controller.handleWebhookPayload(req, res);
  })

  debug(
    "Configured get endpoint /challengemetricstatus for messaging about approved or rejected challenges"
  )
  webserver.post("/challengemetricstatus", function(req, res) {
    console.log("Request query for challenge metric status ", req.body)

    let { ChallengeMetric } = req.body.data
    let { user, challenge, status } = ChallengeMetric.node
    let { id, firstName, lastName } = user
    let { title, session } = challenge
    let sessionTitle = session.title
    let { number } = session

    const bot = controller.spawn({})

    if (status === "Approved" && challenge.title !== "Accept Challenge") {
      controller.studio
        .get(bot, "Challenge Metric Approved", id, `Bot-${id}`)
        .then(convo => {
          convo.setVar("firstName", firstName)
          convo.setVar("lastName", lastName)
          convo.setVar("title", title)
          convo.setVar("userId", id)
          convo.setVar("sessionTitle", sessionTitle)
          convo.setVar("sessionNumber", number)

          // crucial! call convo.activate to set it in motion
          convo.activate()
        })

      res.status(200)
      res.end("OK")
    } else if (challenge.title === "Accept Challenge") {
      return null
    } else {
      controller.studio
        .get(bot, "Challenge Metric Rejected", id, `Bot-${id}`)
        .then(convo => {
          convo.setVar("firstName", firstName)
          convo.setVar("lastName", lastName)
          convo.setVar("title", title)
          convo.setVar("userId", id)
          convo.setVar("sessionTitle", session.title)
          convo.setVar("sessionNumber", session.number)

          // crucial! call convo.activate to set it in motion
          convo.activate()
        })

      res.status(200)
      res.end("OK")
    }
  })
}
