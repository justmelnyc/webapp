/** @jest-environment node */
/* eslint-disable */
// Facts about the seeded world that docs, tests and the apps rely on.
const { build, SEED_VERSION } = require('./seed')
const clock = require('./clock')
const { PEOPLE } = require('./people')

const NOW = Date.parse('2027-03-01T12:00:00.000Z')
const db = build(NOW)
const user = name => db.users.find(u => u.username === name)
const age = record => NOW - Date.parse(record.createdAt)
const html = post => post.regions.filter(r => r.kind === 'text').map(r => r.data).join(' ')
const kinds = post => post.regions.map(r => r.kind)

describe('the clock', () => {
  it('is the only thing that differs between two runs', () => {
    const later = build(NOW + 5 * clock.DAY)
    const shifted = JSON.parse(JSON.stringify(later, (key, value) => (
      typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) ? clock.iso(Date.parse(value) - 5 * clock.DAY) : value
    )))
    expect({ ...shifted, seededAt: NOW }).toEqual(db)
    expect(later.posts.map(p => p.token)).toEqual(db.posts.map(p => p.token))
  })

  it('reads like a live site: minutes, then hours, then days, over about a month', () => {
    const ages = db.posts.map(age)
    expect(ages[0]).toBeLessThan(5 * clock.MINUTE)
    expect(ages.filter(a => a < clock.HOUR).length).toBeGreaterThanOrEqual(5)
    expect(ages.filter(a => a < clock.DAY).length).toBeGreaterThan(30)
    expect(ages.filter(a => a > 7 * clock.DAY).length).toBeGreaterThan(60)
    expect(Math.max(...ages)).toBeLessThan(40 * clock.DAY)
    expect([...ages].sort((a, b) => a - b)).toEqual(ages) // db.posts is newest first
  })

  it('dates nothing after the anchor', () => {
    const dated = [...db.posts, ...db.comments, ...db.invitations, ...db.artistInviteSubmissions]
    expect(dated.filter(r => age(r) < 0)).toEqual([])
    expect(db.invitations.filter(i => i.acceptedAt && Date.parse(i.acceptedAt) > NOW)).toEqual([])
    db.comments.forEach((c) => expect(c.createdAt >= db.posts.find(p => p.id === c.postId).createdAt).toBe(true))
    expect(db.seededAt).toBe(NOW)
    expect(db.seedVersion).toBe(SEED_VERSION)
  })

  it('keeps artist invites open, upcoming or closed relative to the anchor', () => {
    db.artistInvites.forEach((invite) => {
      const [opened, closed] = [Date.parse(invite.openedAt), Date.parse(invite.closedAt)]
      if (invite.status === 'open') expect(opened < NOW && closed > NOW).toBe(true)
      if (invite.status === 'upcoming') expect(opened > NOW).toBe(true)
      if (invite.status === 'closed' || invite.status === 'selecting') expect(closed < NOW).toBe(true)
    })
    expect(db.artistInvites.map(i => i.status).sort()).toEqual(['closed', 'closed', 'open', 'open', 'open', 'selecting', 'upcoming'])
  })
})

describe('the people', () => {
  it('keeps the original twelve first, with ada following everyone', () => {
    expect(db.users.slice(0, 12).map(u => u.username)).toEqual(['ada', 'grace', 'mara', 'jules', 'theo', 'noor', 'ines', 'kofi', 'saoirse', 'luca', 'yuki', 'amara'])
    expect(db.users.map(u => u.id)).toEqual(PEOPLE.map((_, i) => String(i + 1)))
    expect(db.follows.filter(f => f.followerId === '1')).toHaveLength(db.users.length - 1)
    expect(db.categoryRoles).toEqual([
      { categoryId: '1', userId: '1', role: 'curator' }, { categoryId: '3', userId: '1', role: 'curator' }, { categoryId: '2', userId: user('grace').id, role: 'moderator' },
    ])
    expect(db.invitations.filter(i => i.inviterId === '1' && i.acceptedById).map(i => i.acceptedById)).toEqual([user('grace').id, user('mara').id])
  })

  it('is about thirty accounts as real ones are: some without avatar, cover, bio or links', () => {
    expect(db.users.length).toBeGreaterThanOrEqual(28)
    expect(new Set(db.users.map(u => u.username)).size).toBe(db.users.length)
    expect(db.users.filter(u => u.noAvatar).length).toBeGreaterThanOrEqual(2)
    expect(db.users.filter(u => !u.hasCover).length).toBeGreaterThanOrEqual(4)
    expect(db.users.filter(u => !u.bio).length).toBeGreaterThanOrEqual(1)
    expect(db.users.filter(u => u.links.length).length).toBeGreaterThan(15)
    const flags = db.users.map(u => `${!!u.hireable}/${!!u.collaborateable}`)
    expect(new Set(flags).size).toBe(4)
    // there is still someone left to follow ada while the mock runs
    expect(db.users.filter(u => u.id !== '1' && !db.follows.some(f => f.followerId === u.id && f.followeeId === '1')).length).toBeGreaterThanOrEqual(8)
  })
})

describe('the feed', () => {
  const originals = db.posts.filter(p => !p.repostOfId)

  it('is a few hundred posts with their own tokens, everyone having posted', () => {
    expect(db.posts.length).toBeGreaterThanOrEqual(300)
    expect(new Set(db.posts.map(p => p.token)).size).toBe(db.posts.length)
    expect(new Set(db.posts.map(p => p.id)).size).toBe(db.posts.length)
    db.users.forEach(u => expect(db.posts.some(p => p.authorId === u.id)).toBe(true))
    expect(db.posts.filter(p => p.authorId === '1').length).toBeGreaterThanOrEqual(8)
    // the older seeders' posts are still there
    ;['shop0x1000', 'emb0x2000', 'srch0x3000'].forEach(token => expect(db.posts.some(p => p.token === token)).toBe(true))
  })

  it('comes in every shape the apps render', () => {
    const count = test => originals.filter(test).length
    expect(count(p => kinds(p).join() === 'text')).toBeGreaterThan(15) // text only
    expect(count(p => !kinds(p).includes('text'))).toBeGreaterThan(15) // pictures only
    expect(count(p => kinds(p).filter(k => k === 'image').length >= 3)).toBeGreaterThan(15) // sets
    expect(count(p => (html(p).match(/<p>/g) || []).length >= 3)).toBeGreaterThanOrEqual(4) // long reads
    expect(count(p => kinds(p).includes('embed'))).toBeGreaterThanOrEqual(6)
    expect(count(p => p.isProduct && p.regions.some(r => r.linkUrl))).toBeGreaterThanOrEqual(12) // buy links
    expect(count(p => /<a href="https:\/\/[^"]+" rel="nofollow noopener" target="_blank">/.test(html(p)))).toBeGreaterThanOrEqual(4)
    expect(count(p => p.contentWarning)).toBeGreaterThanOrEqual(3)
    expect(count(p => /#\w+/.test(html(p).replace(/<[^>]*>/g, '')))).toBeGreaterThan(40)
  })

  it('mentions only people who exist, as links to their profile', () => {
    const mentions = originals.flatMap(p => [...html(p).matchAll(/<a href="\/(\w+)" class="user-mention">@(\w+)<\/a>/g)])
    expect(mentions.length).toBeGreaterThanOrEqual(5)
    mentions.forEach(([, href, name]) => { expect(href).toBe(name); expect(user(name)).toBeTruthy() })
    expect(db.posts.filter(p => html(p).includes('{m}'))).toEqual([])
  })

  it('does not repeat a caption', () => {
    const texts = db.posts.filter(p => p.token.startsWith('p')).map(html).filter(Boolean).map(t => t.replace(/ #\w+/g, ''))
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('has a long tail: a few popular posts, many quiet ones', () => {
    const loves = originals.map(p => db.loves.filter(l => l.postId === p.id).length).sort((a, b) => b - a)
    const comments = originals.map(p => db.comments.filter(c => c.postId === p.id).length).sort((a, b) => b - a)
    const views = originals.map(p => p.views).sort((a, b) => b - a)
    const median = list => list[Math.floor(list.length / 2)]
    expect(loves[0]).toBeGreaterThan(median(loves) * 4)
    expect(comments[0]).toBeGreaterThanOrEqual(12)
    expect(comments.filter(n => n === 0).length).toBeGreaterThan(originals.length / 3)
    expect(views[0]).toBeGreaterThan(median(views) * 20)
    expect(db.loves.filter(l => db.posts.find(p => p.id === l.postId).authorId === l.userId)).toEqual([])
  })

  it('has threads with emoji, pictures, questions to the author and the author answering', () => {
    expect(db.comments.filter(c => /\p{Extended_Pictographic}/u.test(c.text)).length).toBeGreaterThan(10)
    const pictures = db.comments.filter(c => c.regions)
    expect(pictures.length).toBeGreaterThanOrEqual(3)
    pictures.forEach(c => expect(c.regions.map(r => r.kind)).toEqual(['text', 'image']))
    expect(db.comments.filter(c => c.text.includes('class="user-mention"')).length).toBeGreaterThan(5)
    expect(db.comments.filter(c => db.posts.find(p => p.id === c.postId).authorId === c.authorId).length).toBeGreaterThan(20)
  })

  it('has reposts with and without a note, none by ada, never of your own post', () => {
    const reposts = db.posts.filter(p => p.repostOfId)
    expect(reposts.length).toBeGreaterThanOrEqual(5)
    expect(reposts.some(p => p.regions.length)).toBe(true)
    expect(reposts.some(p => !p.regions.length)).toBe(true)
    expect(reposts.filter(p => p.authorId === '1')).toEqual([])
    reposts.forEach((p) => {
      const source = db.posts.find(x => x.id === p.repostOfId)
      expect(source.repostOfId).toBeUndefined()
      expect(source.authorId).not.toBe(p.authorId)
      expect(p.createdAt > source.createdAt).toBe(true)
    })
    expect(db.repostsSeeded).toBe(true)
  })
})
