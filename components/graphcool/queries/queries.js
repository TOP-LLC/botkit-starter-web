export const get_current_progress = `
  query($psid: String!) {
    User(psid: $psid) {
      id
      progressCurrent {
        challenge {
          id
          type
          title
          activities(filter: { type: ChallengeSubmission }) {
            id
            type
            title
            text
            url
            questions
            answerType
          }
        }
      }
    }
  }
`

export const get_progress_complete = `
  query($psid: String!) {
    User(psid: $psid) {
      id
      progressComplete {
        id
        sprints {
          id
        }
        challenges {
          id
        }
        sessions {
          id
        }
        cycles {
          id
        }
        programs {
          id
        }
        activities {
          id
        }
      }
    }
  }
`
export const get_user_enrollment = `
query ($psid: String!) {
  User(psid: $psid) {
    id
    firstName
    lastName
    type
    status
    accountStatus
  }
}
`
