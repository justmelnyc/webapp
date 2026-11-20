/* eslint-disable */
// The four notification kinds the rest of the mock never made, seeded once per db from its real data:
//   - new_followed_user_post: "you started following X", for each user's two newest follows
//   - watch_comment_notification: someone commented on a post you watch (the watch and comment are added too)
//   - watch_on_repost_notification: someone watches your repost
//   - watch_on_original_post_notification: someone watches a repost of your post
const { db, nextId, postById } = require('./db')

const DAY = 86400000
const WATCH_SEED = 1
const FOLLOWED_PER_USER = 2

const KIND = {
  newFollowed: 'new_followed_user_post',
  watchComment: 'watch_comment_notification',
  watchRepost: 'watch_on_repost_notification',
  watchOriginal: 'watch_on_original_post_notification',
}

const SUBJECT_TYPE = {
  [KIND.watchComment]: 'Comment',
  [KIND.watchRepost]: 'Watch',
  [KIND.watchOriginal]: 'Watch',
}

const COMMENTS = ['This one keeps getting better.', 'Saving this for later.', 'The light here is unreal.']

const watch = (userId, postId) => {
  if (!db.watches.some(w => w.userId === userId && w.postId === postId)) db.watches.push({ userId, postId })
}

// `add` is notifications.js's record helper; dates never pass a user's read marker, so nothing turns unread.
const seed = (add, now, rand) => {
  const pick = list => list[Math.floor(rand() * list.length)]
  const readAt = id => Date.parse((db.notificationReads || {})[id] || '') || now
  const when = id => new Date(Math.min(readAt(id), now) - Math.floor(rand() * 4 * DAY) - 900000).toISOString()
  db.users.forEach((u) => {
    const others = db.users.filter(x => x.id !== u.id)
    db.follows.filter(f => f.followerId === u.id).slice(-FOLLOWED_PER_USER).forEach((f) => {
      add({ key: `followed:${u.id}:${f.followeeId}`, userId: u.id, kind: KIND.newFollowed, createdAt: when(u.id), subjectUserId: f.followeeId })
    })
    const watched = pick(db.posts.filter(p => p.authorId !== u.id && !p.repostOfId))
    const commenter = watched && pick(others.filter(x => x.id !== watched.authorId))
    if (watched && commenter) {
      watch(u.id, watched.id)
      const comment = { id: nextId(), postId: watched.id, authorId: commenter.id, createdAt: when(u.id), text: pick(COMMENTS) }
      db.comments.push(comment)
      add({ key: `watchcomment:${comment.id}`, userId: u.id, kind: KIND.watchComment, createdAt: comment.createdAt, postId: watched.id, commentId: comment.id })
    }
    db.posts.filter(p => p.repostOfId).forEach((p) => {
      const original = postById(p.repostOfId)
      const watcher = pick(others.filter(x => x.id !== p.authorId && (!original || x.id !== original.authorId)))
      if (!watcher) return
      if (p.authorId === u.id) {
        watch(watcher.id, p.id)
        add({ key: `watchrepost:${watcher.id}:${p.id}`, userId: u.id, kind: KIND.watchRepost, createdAt: when(u.id), postId: p.id, actorId: watcher.id })
      }
      if (original && original.authorId === u.id) {
        watch(watcher.id, p.id)
        add({ key: `watchorig:${watcher.id}:${p.id}`, userId: u.id, kind: KIND.watchOriginal, createdAt: when(u.id), postId: p.id, actorId: watcher.id })
      }
    })
  })
}

module.exports = { KIND, SUBJECT_TYPE, WATCH_SEED, seed }
