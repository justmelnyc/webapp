/* eslint-disable */
// Everything the mock stores about one user, as a JSON document (the "Export Data" download).
const exportFor = (db, user, now = new Date()) => {
  const posts = db.posts.filter(p => p.authorId === user.id)
  const { passwordHash, ...profile } = user
  return {
    exportedAt: now.toISOString(),
    profile,
    posts: posts.map(p => ({ id: p.id, token: p.token, createdAt: p.createdAt, regions: p.regions, categoryIds: p.categoryIds })),
    comments: db.comments.filter(c => c.authorId === user.id),
    loves: db.loves.filter(l => l.userId === user.id),
    watches: db.watches.filter(w => w.userId === user.id),
    following: db.follows.filter(f => f.followerId === user.id).map(f => f.followeeId),
    followers: db.follows.filter(f => f.followeeId === user.id).map(f => f.followerId),
  }
}

// Remove a user and everything that hangs off them
const removeUser = (db, user) => {
  const postIds = db.posts.filter(p => p.authorId === user.id).map(p => p.id)
  db.users = db.users.filter(u => u.id !== user.id)
  db.posts = db.posts.filter(p => p.authorId !== user.id)
  db.comments = db.comments.filter(c => c.authorId !== user.id && !postIds.includes(c.postId))
  db.loves = db.loves.filter(l => l.userId !== user.id && !postIds.includes(l.postId))
  db.watches = db.watches.filter(w => w.userId !== user.id && !postIds.includes(w.postId))
  db.follows = db.follows.filter(f => f.followerId !== user.id && f.followeeId !== user.id)
}

module.exports = { exportFor, removeUser }
