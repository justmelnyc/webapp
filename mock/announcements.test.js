/**
 * @jest-environment node
 */
/* eslint-disable */
jest.mock('./db', () => {
  const db = { seq: 100, users: [{ id: '1' }, { id: '2' }] }
  return { db, save: jest.fn(), nextId: () => String(++db.seq) }
})
jest.mock('./media', () => ({
  photoUrl: (seed, w, h) => `http://img/${seed}/${w}/${h}`,
  responsive: url => ({ hdpi: { url } }),
}))

const { db } = require('./db')
const a = require('./announcements')

beforeEach(() => {
  delete db.announcements
  delete db.announcementReads
})

describe('announcements', () => {
  it('seeds one for a fresh db', () => {
    expect(a.unread('1')).toMatchObject({ header: expect.any(String), ctaHref: '/discover', imageUrl: 'http://img/announcement/140/140' })
    expect(db.announcements).toHaveLength(1)
  })

  it('serves the newest announcement the viewer has not closed, in the shape the original reads', () => {
    a.unread('1')
    a.create({ header: 'First', body: 'One' })
    const second = a.create({ header: 'Second', body: 'Two', ctaHref: '/discover', ctaCaption: 'Go', imageUrl: 'http://img/x' })
    expect(a.unread('1').id).toBe(second.id)
    expect(a.serialize(second)).toMatchObject({
      id: second.id, header: 'Second', body: 'Two', ctaHref: '/discover', ctaCaption: 'Go', isStaffPreview: false,
      image: { hdpi: { url: 'http://img/x' } },
    })
  })

  it('defaults the call to action caption and has no image without one', () => {
    const made = a.create({ header: 'Hi' })
    expect(a.serialize(made)).toMatchObject({ ctaCaption: 'Learn More', ctaHref: null, image: null })
  })

  it('closing hides it for that viewer only, until a newer one arrives', () => {
    a.unread('1')
    a.markRead('1')
    expect(a.unread('1')).toBeNull()
    expect(a.unread('2')).not.toBeNull()
    const next = a.create({ header: 'Next' })
    expect(a.unread('1').id).toBe(next.id)
  })
})
