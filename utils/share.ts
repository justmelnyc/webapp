import type { Post, Region } from '@/types/post'

/** The channels in the original's `ShareDialog`, in its button order. */
export const SHARE_TYPES = ['email', 'facebook', 'twitter', 'pinterest', 'google+', 'tumblr', 'reddit', 'linkedin'] as const
export type ShareType = (typeof SHARE_TYPES)[number]

/** Pop-up window sizes; email opens the mail client instead (`SHARE_DIMENSIONS`). */
export const SHARE_DIMENSIONS: Record<Exclude<ShareType, 'email'>, { width: number; height: number }> = {
  facebook: { width: 480, height: 210 },
  'google+': { width: 500, height: 385 },
  linkedin: { width: 550, height: 460 },
  pinterest: { width: 750, height: 320 },
  reddit: { width: 540, height: 420 },
  tumblr: { width: 450, height: 430 },
  twitter: { width: 520, height: 250 },
}

export interface ShareContent {
  link: string
  /** Already URI encoded, as the original keeps them (`shareLinkSafe`, `summarySafe`, ...). */
  linkSafe: string
  summarySafe: string
  tweetSummarySafe: string
  emailSubjectSafe: string
  emailBodySafe: string
  image: string | null
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }

/** `div.textContent` of the original: tags dropped, the common entities decoded. */
export const htmlToText = (html: string): string =>
  html.replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity] ?? entity)

/** Tweets stay within 140 characters including the link, cut at a word boundary. */
const tweetSummaryOf = (summary: string, link: string): string => {
  if (summary.length + link.length <= 139) return summary
  const words = summary.slice(0, 139 - link.length).split(' ')
  words.pop()
  return words.join(' ')
}

const enc = encodeURIComponent

const firstImageUrl = (regions: Region[]): string | null => {
  for (const region of regions) {
    const url = region.kind === 'image' ? region.data.url : null
    if (url) return url.startsWith('//') ? `http:${url}` : url
  }
  return null
}

type SharedPost = Pick<Post, 'token' | 'summary'> & { author: Pick<Post['author'], 'username'> }

/** `getMountSharePost`: what a post shares (its link, summary text and first image). */
export const postShareContent = (origin: string, post: SharedPost): ShareContent => {
  const { username } = post.author
  const link = `${origin}/${username}/post/${post.token}`
  let summary = 'Check out this post on Ello'
  const emailSubject = `${summary}, via @${username}`
  for (const region of post.summary) {
    if (region.kind === 'text') summary = htmlToText(region.data)
  }
  const summarySafe = enc(summary)
  const linkSafe = enc(link)
  return {
    link,
    linkSafe,
    summarySafe,
    tweetSummarySafe: enc(tweetSummaryOf(summary, link)),
    emailSubjectSafe: enc(emailSubject),
    emailBodySafe: `${summarySafe}%0D%0A%0D%0A${linkSafe}`,
    image: firstImageUrl(post.summary),
  }
}

/** `getMountShareUser`: what a profile shares. */
export const userShareContent = (origin: string, username: string): ShareContent => {
  const link = `${origin}/${username}`
  const summarySafe = enc(`Check out @${username} on Ello`)
  const linkSafe = enc(link)
  return {
    link,
    linkSafe,
    summarySafe,
    tweetSummarySafe: summarySafe,
    emailSubjectSafe: summarySafe,
    emailBodySafe: `${summarySafe}%0D%0A%0D%0A${linkSafe}`,
    image: null,
  }
}

/** `getUrl`: the address to open for a channel. */
export const shareUrl = (type: ShareType, c: ShareContent): string => {
  switch (type) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${c.linkSafe}`
    case 'google+':
      return `https://plus.google.com/share?url=${c.linkSafe}`
    case 'linkedin':
      return `http://www.linkedin.com/shareArticle?mini=true&url=${c.linkSafe}&title=${c.summarySafe}`
    case 'pinterest':
      return `http://pinterest.com/pin/create/button/?url=${c.linkSafe}&description=${c.summarySafe}&media=${c.image}`
    case 'reddit':
      return `http://reddit.com/submit?url=${c.linkSafe}&title=${c.summarySafe}`
    case 'tumblr':
      return `http://www.tumblr.com/share/link?url=${c.linkSafe}&name=${c.summarySafe}`
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${c.linkSafe}&text=${c.tweetSummarySafe}`
    case 'email':
      return `mailto:?subject=${c.emailSubjectSafe}&body=${c.emailBodySafe}`
  }
}
