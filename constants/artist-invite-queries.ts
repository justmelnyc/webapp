import { postFields } from '@/constants/queries'

/** Submissions arrive as REST records that only name their posts; the posts themselves come from here. */
export const FIND_POSTS = `
  query($tokens: [String]!) { findPosts(tokens: $tokens) { ${postFields} } }
`
