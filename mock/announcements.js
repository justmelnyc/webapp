/* eslint-disable */
// Announcements: one banner at a time above the notifications (GET /api/v2/most_recent_announcements).
// A user has seen everything up to `db.announcementReads[userId]`; dismissing marks the newest as read.
// Records: db.announcements = [{ id, header, body, ctaCaption, ctaHref, imageUrl, isStaffPreview, createdAt }]
const { db, save, nextId } = require('./db')
const media = require('./media')

const SEEDS = [{
  header: 'Ello is running on the mock',
  body: 'This announcement comes from the mock API. Close it and it stays gone for you until the next one arrives.',
  ctaCaption: 'Explore Discover',
  ctaHref: '/discover',
  imageSeed: 'announcement',
}]

const create = (fields) => {
  db.announcements = db.announcements || []
  const announcement = { id: nextId(), isStaffPreview: false, ctaCaption: 'Learn More', ctaHref: null, imageUrl: null, ...fields, createdAt: new Date().toISOString() }
  db.announcements.push(announcement)
  save()
  return announcement
}

const seed = () => {
  if (db.announcements) return
  db.announcements = []
  db.announcementReads = {}
  SEEDS.forEach(({ imageSeed, ...fields }) => create({ ...fields, imageUrl: imageSeed ? media.photoUrl(imageSeed, 140, 140) : null }))
}

const unread = (userId) => {
  seed()
  const seen = Number((db.announcementReads || {})[userId] || 0)
  const list = db.announcements.filter(a => Number(a.id) > seen)
  return list[list.length - 1] || null
}

// The model the original's reducer stores: it reads `header`, `body`, `ctaCaption`, `ctaHref`, `image.hdpi.url`.
const serialize = a => ({
  id: a.id,
  header: a.header,
  body: a.body,
  ctaCaption: a.ctaCaption,
  ctaHref: a.ctaHref,
  isStaffPreview: !!a.isStaffPreview,
  image: a.imageUrl ? media.responsive(a.imageUrl, 140, 140) : null,
})

const markRead = (userId) => {
  seed()
  const newest = db.announcements[db.announcements.length - 1]
  db.announcementReads = db.announcementReads || {}
  if (newest) db.announcementReads[userId] = newest.id
  save()
}

module.exports = { create, unread, serialize, markRead }
