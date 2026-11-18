const { parseTerms, searchPosts, pageOf, linkHashtags, unlinkHashtags, hashtagsOf, seedSearchPosts, SEED_POSTS } = require('./post-search')

const users = [{ id: '1', username: 'ada' }, { id: '2', username: 'mara' }]
const text = (data, extra = {}) => ({ regions: [{ kind: 'text', data }], ...extra })
const makeDb = () => ({
  users,
  posts: [
    { id: 'a', authorId: '1', createdAt: '2026-01-01T00:00:00Z', ...text('<p>Morning <b>light</b> #Film #street</p>') },
    { id: 'b', authorId: '2', createdAt: '2026-01-03T00:00:00Z', ...text('<p>Lighthouse at dusk #film</p>') },
    { id: 'c', authorId: '2', createdAt: '2026-01-02T00:00:00Z', ...text('<p>Nothing to see</p>') },
    { id: 'd', authorId: '1', createdAt: '2026-01-04T00:00:00Z', regions: [{ kind: 'image', data: { url: null, alt: 'A red barn' } }] },
  ],
  seq: 1000,
})
const ids = (db, terms) => searchPosts(db, terms).map(p => p.id)

describe('parseTerms', () => {
  it('splits words, lowercases, decodes and flags hashtags', () => {
    expect(parseTerms('  Light %23Film ')).toEqual([{ tag: false, word: 'light' }, { tag: true, word: 'film' }])
    expect(parseTerms('@ada')).toEqual([{ tag: false, word: 'ada' }])
    expect(parseTerms('#')).toEqual([])
    expect(parseTerms('100%')).toEqual([{ tag: false, word: '100%' }]) // not valid percent-encoding
  })
})

describe('searchPosts', () => {
  it('matches the start of words in post text, newest first', () => {
    expect(ids(makeDb(), 'light')).toEqual(['b', 'a'])
    expect(ids(makeDb(), 'LIGHT')).toEqual(['b', 'a'])
    expect(ids(makeDb(), 'ght')).toEqual([]) // not mid-word
  })

  it('requires every term to match', () => {
    expect(ids(makeDb(), 'light morning')).toEqual(['a'])
    expect(ids(makeDb(), 'light zzz')).toEqual([])
  })

  it('matches usernames', () => {
    expect(ids(makeDb(), 'mara')).toEqual(['b', 'c'])
    expect(ids(makeDb(), '@ada')).toEqual(['d', 'a'])
  })

  it('matches hashtags exactly, case-insensitively', () => {
    expect(ids(makeDb(), '#film')).toEqual(['b', 'a'])
    expect(ids(makeDb(), '%23FILM')).toEqual(['b', 'a'])
    expect(ids(makeDb(), '#fil')).toEqual([])
    expect(ids(makeDb(), '#street light')).toEqual(['a'])
  })

  it('searches image alt text and ignores blank terms', () => {
    expect(ids(makeDb(), 'barn')).toEqual(['d'])
    expect(ids(makeDb(), '   ')).toEqual([])
  })
})

describe('pageOf', () => {
  it('pages by offset cursor', () => {
    const list = [1, 2, 3, 4, 5]
    expect(pageOf(list, undefined, 2)).toEqual({ items: [1, 2], next: '2', isLastPage: false })
    expect(pageOf(list, '4', 2)).toEqual({ items: [5], next: null, isLastPage: true })
    expect(pageOf([], null, 2)).toEqual({ items: [], next: null, isLastPage: true })
  })
})

describe('hashtags', () => {
  it('turns #tags in text (not in attributes) into hashtag-link spans and back', () => {
    const html = '<p><a href="/x#frag">go</a> #film and #a_b</p>'
    const linked = linkHashtags(html)
    expect(linked).toContain('<span class="hashtag-link" data-href="/search?terms=%23film">#film</span>')
    expect(linked).toContain('data-href="/search?terms=%23a_b"')
    expect(linked).toContain('href="/x#frag"')
    expect(unlinkHashtags(linked)).toBe(html)
  })

  it('lists the hashtags of a text', () => {
    expect(hashtagsOf('#One two #Three')).toEqual(['one', 'three'])
  })
})

describe('seedSearchPosts', () => {
  it('adds the seed posts once, older than existing posts, with searchable hashtags', () => {
    const db = { users: ['ada', 'grace', 'mara', 'jules', 'theo', 'yuki', 'saoirse', 'luca', 'noor', 'ines', 'kofi', 'amara'].map((username, i) => ({ id: String(i + 1), username })), posts: [], seq: 1000 }
    const nextId = () => String(++db.seq)
    expect(seedSearchPosts(db, nextId)).toBe(SEED_POSTS.length)
    expect(seedSearchPosts(db, nextId)).toBe(0)
    expect(db.posts).toHaveLength(SEED_POSTS.length)
    expect(new Set(db.posts.map(p => p.token)).size).toBe(SEED_POSTS.length)
    expect(searchPosts(db, '#film').length).toBeGreaterThan(1)
    expect(searchPosts(db, 'light').length).toBeGreaterThan(1)
  })
})
