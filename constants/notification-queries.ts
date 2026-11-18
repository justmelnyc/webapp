import { postFieldsWithSource as postFields } from '@/constants/queries'

const authorSummary = `id username name avatar { small { url } regular { url } large { url } original { url } } currentUserState { relationshipPriority }`
const postSummary = `{ ${postFields} }`
const categorySummary = `{ id slug name }`

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
          ... on ArtistInviteSubmission { id status post ${postSummary} artistInvite { id title slug } }
          ... on CategoryPost { id status category ${categorySummary} post ${postSummary} featuredBy { ${authorSummary} } }
          ... on CategoryUser { id role category ${categorySummary} user { ${authorSummary} } featuredBy { ${authorSummary} } }
        }
      }
    }
  }
`

export const NEW_NOTIFICATIONS = `query { newNotificationStreamContent { newContent } }`
