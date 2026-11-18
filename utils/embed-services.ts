/** The embed services the original activated (`embetter_initializer.js`): regexes, canonical links and players. */

const prefixed = (source: string): RegExp => new RegExp(`(?:https?:\\/\\/)?(?:w{3}\\.)?${source}(?:\\/?|$|\\s|\\?|#)`)

export interface EmbedService {
  name: string
  regex: RegExp
  /** Canonical link for an id. */
  link: (id: string) => string
  /** The player iframe's `src`. */
  player: (id: string, autoplay: boolean) => string
}

export const EMBED_SERVICES: readonly EmbedService[] = [
  {
    name: 'youtube',
    regex: /(?:.+?)?(?:youtube\.com\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/,
    link: (id) => `https://www.youtube.com/watch?v=${id}`,
    player: (id, autoplay) =>
      `https://www.youtube.com/embed/${id}?rel=0&suggestedQuality=hd720&enablejsapi=1${autoplay ? '&autoplay=1' : ''}`,
  },
  {
    name: 'vimeo',
    regex: prefixed('vimeo.com\\/(\\S*)'),
    link: (id) => `https://vimeo.com/${id}`,
    player: (id, autoplay) =>
      `//player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&color=ffffff&api=1&player_id=${id}${autoplay ? '&autoplay=1' : ''}`,
  },
  {
    name: 'soundcloud',
    regex: prefixed('(?:soundcloud.com|snd.sc)\\/([a-zA-Z0-9_-]*(?:\\/sets)?(?:\\/groups)?\\/[a-zA-Z0-9_-]*)'),
    link: (id) => `https://soundcloud.com/${id}`,
    player: (id, autoplay) => {
      const path = /^(playlist|track|group)/.test(id) ? id : `tracks/${id}`
      const auto = autoplay ? '&auto_play=true' : ''
      return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/${path}${auto}&hide_related=false&color=373737&show_comments=false&show_user=true&show_reposts=false&visual=true`
    },
  },
  {
    name: 'dailymotion',
    regex: prefixed('dailymotion.com\\/video\\/([a-zA-Z0-9-_]*)'),
    link: (id) => `http://www.dailymotion.com/video/${id}`,
    player: (id, autoplay) => `//www.dailymotion.com/embed/video/${id}${autoplay ? '?autoPlay=1' : ''}`,
  },
  {
    name: 'mixcloud',
    regex: prefixed('(?:mixcloud.com)\\/(.*\\/.*)'),
    link: (id) => `https://www.mixcloud.com/${id}`,
    player: (id, autoplay) =>
      `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(`http://www.mixcloud.com/${id}`)}&replace=0&hide_cover=1&stylecolor=ffffff&embed_type=widget_standard&${autoplay ? 'autoplay=true' : ''}`,
  },
  {
    name: 'codepen',
    regex: prefixed('(?:codepen.io)\\/([a-zA-Z0-9_\\-%]*\\/[a-zA-Z0-9_\\-%]*\\/[a-zA-Z0-9_\\-%]*)'),
    link: (id) => `https://codepen.io/${id.replace('/embed/', '/pen/')}`,
    player: (id) => {
      const embedId = id.replace('/pen/', '/embed/')
      const [user = '', , slugHash = ''] = embedId.split('/')
      return `//codepen.io/${embedId}?theme-id=0&slug-hash=${slugHash}&default-tab=result&user=${user}`
    },
  },
  {
    name: 'bandcamp',
    regex: prefixed('([a-zA-Z0-9_\\-]*.bandcamp.com\\/(?:album|track)\\/[a-zA-Z0-9_\\-%]*)'),
    link: (id) => `https://${id}`,
    player: (id) => `https://bandcamp.com/EmbeddedPlayer/${id}/size=large/bgcol=ffffff/linkcol=333333/tracklist=true/artwork=small/transparent=true/`,
  },
  {
    name: 'ustream',
    regex: prefixed('(?:ustream.tv|ustre.am)\\/((?:(?:recorded|channel)\\/)?[a-zA-Z0-9_\\-%]*)'),
    link: (id) => `http://www.ustream.tv/${id}`,
    player: (id, autoplay) => `https://www.ustream.tv/embed/${id}?v=3&wmode=direct${autoplay ? '&autoplay=true' : ''}`,
  },
]

export const embedServiceByName = (name: string): EmbedService | undefined =>
  EMBED_SERVICES.find((service) => service.name === name)

export interface EmbedMatch {
  service: string
  id: string
  /** The canonical link the original sent to `post_previews`. */
  url: string
}

/** The original's `checkForEmbeds`: the first active service whose regex matches the pasted text. */
export const matchEmbed = (text: string): EmbedMatch | null => {
  for (const service of EMBED_SERVICES) {
    const id = text.match(service.regex)?.[1]
    if (id) return { service: service.name, id, url: service.link(id) }
  }
  return null
}

/** The iframe `src` that plays an embed, or null for services we do not know. */
export const embedPlayerSrc = (serviceName: string, id: string, autoplay: boolean): string | null =>
  embedServiceByName(serviceName)?.player(id, autoplay) ?? null
