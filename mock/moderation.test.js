/**
 * @jest-environment node
 */
/* eslint-disable */
const { build } = require('./seed')
const m = require('./moderation')

const fresh = () => m.ensureModerationData(build())

describe('block / mute', () => {
  it('resolves the viewer mark on a target', () => {
    const db = fresh()
    expect(m.blockKind(db, '1', '2')).toBeNull()
    m.setBlock(db, '1', '2', 'mute')
    expect(m.blockKind(db, '1', '2')).toBe('mute')
    m.setBlock(db, '1', '2', 'block')
    expect(m.blockKind(db, '1', '2')).toBe('block')
    expect(db.blocks).toHaveLength(1)
  })

  it('counts the blocked and the muted users for the profile', () => {
    const db = fresh()
    expect(m.blockCounts(db, '1')).toEqual({ blockedCount: 0, mutedCount: 0 })
    m.setBlock(db, '1', '2', 'block')
    m.setBlock(db, '1', '3', 'mute')
    m.setBlock(db, '1', '4', 'mute')
    expect(m.blockCounts(db, '1')).toEqual({ blockedCount: 1, mutedCount: 2 })
    expect(m.blockCounts(db, '2')).toEqual({ blockedCount: 0, mutedCount: 0 })
    expect(m.blockCounts(db, null)).toEqual({ blockedCount: 0, mutedCount: 0 })
  })

  it('blocking removes follows both ways; inactive clears the mark', () => {
    const db = fresh()
    db.follows.push({ followerId: '2', followeeId: '1' })
    m.setBlock(db, '1', '2', 'block')
    expect(db.follows.some(f => (f.followerId === '1' && f.followeeId === '2') || (f.followerId === '2' && f.followeeId === '1'))).toBe(false)
    expect(m.setBlock(db, '1', '2', 'inactive')).toBe(false)
    expect(m.blockKind(db, '1', '2')).toBeNull()
  })

  it('hides posts from blocked, muted and blocking authors only', () => {
    const db = fresh()
    m.setBlock(db, '1', '2', 'mute')
    m.setBlock(db, '3', '1', 'block')
    expect(m.isHiddenFrom(db, '1', '2')).toBe(true)
    expect(m.isHiddenFrom(db, '1', '3')).toBe(true)
    expect(m.isHiddenFrom(db, '1', '4')).toBe(false)
    expect(m.isHiddenFrom(db, '2', '1')).toBe(false)
    expect(m.isHiddenFrom(db, null, '2')).toBe(false)
    const posts = [{ authorId: '2' }, { authorId: '3' }, { authorId: '4' }]
    expect(m.visiblePosts(db, '1', posts)).toEqual([{ authorId: '4' }])
  })
})

describe('flags', () => {
  it('accepts the seven kinds only', () => {
    m.FLAG_KINDS.forEach(k => expect(m.isFlagKind(k)).toBe(true))
    expect(m.isFlagKind('rude')).toBe(false)
    expect(m.FLAG_KINDS).toHaveLength(7)
  })
})

describe('migration', () => {
  it('seeds availability, roles, long bios and NSFW posts once', () => {
    const db = fresh()
    const by = n => db.users.find(u => u.username === n)
    expect(by('mara')).toMatchObject({ hireable: true, collaborateable: true })
    expect(by('grace')).toMatchObject({ hireable: false, collaborateable: true })
    expect(by('ada').hireable).toBeUndefined()
    expect(m.categoryUsers(by('mara')).map(c => c.role)).toEqual(['FEATURED'])
    const roles = [{ categoryId: '2', userId: by('mara').id, role: 'moderator' }]
    expect(m.categoryUsers(by('mara'), roles).map(c => [c.id, c.role])).toEqual([[`2-${by('mara').id}-moderator`, 'MODERATOR'], [`4-${by('mara').id}-featured`, 'FEATURED']])
    expect(m.categoryUsers(by('jules'))[0].category).toEqual({ id: '3', name: 'Design', slug: 'design' })
    expect(by('yuki').bio.length).toBeGreaterThan(150)
    const nsfw = db.posts.filter(p => p.contentWarning)
    expect(nsfw.length).toBeGreaterThanOrEqual(4)
    expect(nsfw.some(p => p.authorId === by('ada').id)).toBe(true)
    by('yuki').bio = 'edited'
    m.ensureModerationData(db)
    expect(by('yuki').bio).toBe('edited')
  })
})
