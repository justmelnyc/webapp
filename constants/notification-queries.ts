import { postFields } from '@/constants/queries'

const authorSummary = `id username name avatar { small { url } regular { url } large { url } original { url } } currentUserState { relationshipPriority }`
const postSummary = `{ ${postFields} }`

export const NOTIFICATION_STREAM = `
  query($perPage: Int, $before: String, $category: NotificationCategory) {
    notificationStream(perPage: $perPage, before: $before, category: $category) {
      isLastPage next
      notifications {
        id kind subjectType createdAt
        subject {
          __typename
          ... on Post { ${postFields} }
          ... on Comment { id createdAt author { ${authorSummary} } content { kind data linkUrl } parentPost ${postSummary} }
          ... on User { ${authorSummary} }
          ... on Love { id post ${postSummary} user { ${authorSummary} } }
          ... on Watch { id post ${postSummary} user { ${authorSummary} } }
        }
      }
    }
  }
`

export const NEW_NOTIFICATIONS = `query { newNotificationStreamContent { newContent } }`
