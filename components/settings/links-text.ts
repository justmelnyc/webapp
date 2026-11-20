import type { InfoInput } from '@/lib/schemas/profile'

type Link = InfoInput['links'][number]

/** The original's Links control shows each link's text joined by ", " (`selectLinksAsText`). */
export const linksToText = (links: Link[]): string => links.map((link) => link.text || link.url).join(', ')

const withScheme = (token: string): string => (/^[a-z][a-z\d+.-]*:\/\//i.test(token) ? token : `http://${token}`)

/** Commas or spaces separate links; a known link is matched by its text or URL, a new bare domain gets `http://`. */
export const textToLinks = (text: string, known: Link[]): Link[] =>
  text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((token) => {
      const link = known.find(({ url, text: label }) => url === token || label === token)
      return link ? { url: link.url, text: link.text ?? '' } : { url: withScheme(token), text: token }
    })
