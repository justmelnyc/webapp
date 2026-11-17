/* eslint-disable */
// Preference toggles shown on /settings. Each saves by PATCHing /api/v2/profile with { <key>: bool }.
const TOGGLES = [
  {
    label: 'Privacy',
    items: [
      { key: 'is_public', label: 'Public profile', info: 'Anyone can see your posts, even without an account.' },
      { key: 'has_commenting_enabled', label: 'Allow comments', info: 'Let people comment on your posts.' },
      { key: 'has_sharing_enabled', label: 'Allow sharing', info: 'Show share links on your posts.' },
      { key: 'has_reposting_enabled', label: 'Allow reposting', info: 'Let people repost your work.' },
      { key: 'has_loves_enabled', label: 'Allow loves', info: 'Let people love your posts.' },
    ],
  },
  {
    label: 'Content',
    items: [
      { key: 'views_adult_content', label: 'Show NSFW content', info: 'Display posts marked as adult content.' },
      { key: 'posts_adult_content', label: 'My posts are NSFW', info: 'Mark everything you post as adult content.' },
      { key: 'has_auto_watch_enabled', label: 'Auto-watch comments', info: 'Watch posts you comment on.' },
    ],
  },
]

const KEYS = TOGGLES.reduce((all, s) => all.concat(s.items.map(i => i.key)), [])
const camel = key => key.replace(/_(\w)/g, (m, c) => c.toUpperCase())
const DEFAULTS = { is_public: true, has_commenting_enabled: true, has_sharing_enabled: true, has_reposting_enabled: true, has_loves_enabled: true, views_adult_content: false, posts_adult_content: false, has_auto_watch_enabled: true }

// camelCased preference values for a user (defaults overlaid with what they saved)
const prefsFor = (user) => {
  const out = {}
  KEYS.forEach((key) => { out[camel(key)] = user.prefs && key in user.prefs ? user.prefs[key] : DEFAULTS[key] })
  return out
}

module.exports = { TOGGLES, KEYS, prefsFor }
