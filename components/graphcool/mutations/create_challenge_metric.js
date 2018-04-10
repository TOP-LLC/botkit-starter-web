const lokkaClient = require("./../../lokka_graphcool.js")
const request = require("request").defaults({
  encoding: null
})

module.exports = function(userId, userPsid, answers, challenge) {
  console.log("Create ChallengeMetric")

  let url = answers.upload

  let fileType = url.match(/(?=\.)+[^\/w]+(?=\?)/gim)[0]

  console.log(`Formatted URL is ${url} and file name is ${fileType}`)

  function sendFile(path, fileName) {
    return new Promise((resolve, reject) => {
      request(path, (err, response, body) => {
        if (err) {
          console.log("ERROR: \n", err)
        }

        const r = request.post(
          process.env.GQL_FILE_API,
          (err, response, body) => {
            if (!err) {
              resolve(body)
            } else {
              reject(e)
            }
          }
        )

        const form = r.form()
        form.append("data", body, {
          filename: fileName
        })
      })
    })
  }

  const main = async () => {
    const body = await sendFile(url, `${userId}_${challenge.id}${fileType}`)
    const jsonBody = JSON.parse(body)

    // print file response and id
    console.log("JSON body for sendFile is ", jsonBody)

    return jsonBody
  }

  function challengeMetricMutation(fileId) {
    const mutationQuery = `($url: String!, $challengeId: ID!, $userId: ID!, $messageSubmission: Json!, $status: CHALLENGEMETRICSTATUS!){
          newChallengeMetric: createChallengeMetric (
            url: $url
            challengeId: $challengeId
            messageSubmission: $messageSubmission
            userId: $userId
            status: $status
          )
          {
            id
            user {
              psid
              firstName
              lastName
            }
            messageSubmission
          }
        }`

    const vars = {
      url: url,
      challengeId: challenge.id,
      userId: userId,
      messageSubmission: answers,
      status: "Submitted"
    }

    return lokkaClient.mutate(mutationQuery, vars).then(result => {
      let challengeMetricResult = result.newChallengeMetric

      console.log("Challenge metric result is", challengeMetricResult)

      let challengeMetricId = challengeMetricResult.id

      console.log("Challenge metric ID is ", challengeMetricId)

      console.log("File id is ", fileId)

      const mutationQuery = `($challengeMetricId: ID!, $fileId: ID!){
          newFileOnChallengeMetric: setFileOnChallengeMetric (
              challengeMetricChallengeMetricId: $challengeMetricId
              fileFileId: $fileId
            ) {
              challengeMetricChallengeMetric {
                id
              }
            }
          }`

      const vars = {
        challengeMetricId: challengeMetricId,
        fileId: fileId
      }

      return lokkaClient.mutate(mutationQuery, vars).then(result => {
        const mutationQuery = `($userId: ID!, $fileId: ID!){
            updateFileWithUserId: updateFile (
                id: $fileId
              	userId: $userId
              ) {
                id
                url
                user {
                  id
                  firstName
                }
              }
            }`

        const vars = {
          userId: userId,
          fileId: fileId
        }

        return lokkaClient.mutate(mutationQuery, vars).then(result => {
          const mutationQuery = `($challengeMetricId: ID!, $status: CHALLENGEMETRICSTATUS!){
              updateChallengeMetricStatus: updateChallengeMetric (
                  id: $challengeMetricId
                	status: $status
                ) {
                  id
                }
              }`

          const vars = {
            challengeMetricId: challengeMetricId,
            status: "UnderReview"
          }

          return lokkaClient
            .mutate(mutationQuery, vars)
            .then(result => console.log("Completed create challenge metric"))
        })
      })
    })
  }

  return main()
    .then(body => {
      console.log("This should have the file ID", body.id)
      let fileId = body.id

      return challengeMetricMutation(fileId)
        .then(result => console.log("Mutation result is ", result))
        .catch(err => console.log(err))
    })
    .catch(err => console.error(err))
}
