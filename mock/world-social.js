/* eslint-disable */
// Who is here and what they do to each other's posts: the people, who follows whom, comment threads of
// different lengths, loves and reposts. Deterministic for a given `rand`; nothing is dated after `now`.
const { PEOPLE, toUser } = require('./people')
const clock = require('./clock')
const copy = require('./copy-comments')
const { mention } = require('./world-posts')

const REPLY_WINDOW = 4 * clock.DAY // threads go quiet after a few days
const QUIET_FOLLOWERS = ['kofi', 'sol', 'emeka', 'hana', 'mio', 'caleb', 'idris', 'nell'] // do not follow ada yet

const addPeople = (db) => {
  PEOPLE.forEach((person, i) => db.users.push(toUser(person, i + 1)))
}

// ada (the default login) follows everyone; the others follow well known people more readily
const addFollows = (db, rand) => {
  db.users.forEach((user, i) => {
    db.users.forEach((other, j) => {
      if (i === j) return
      const roll = rand()
      const quiet = j === 0 && QUIET_FOLLOWERS.includes(user.username)
      if (i === 0 || (!quiet && roll < 0.12 + PEOPLE[j].fame * 0.5)) db.follows.push({ followerId: user.id, followeeId: other.id })
    })
  })
}

const freshness = (post, now) => Math.min(1, (now - Date.parse(post.createdAt)) / (20 * clock.HOUR)) ** 0.7

const addComments = (db, { rand, now, nextId }, heat) => {
  const pick = list => list[Math.floor(rand() * list.length)]
  db.posts.forEach((post) => {
    const pop = heat.get(post.id)
    if (pop === undefined) return
    const author = db.users.find(u => u.id === post.authorId)
    const followers = db.follows.filter(f => f.followeeId === author.id).map(f => f.followerId)
    const wanted = pop < 0.12 ? Number(rand() < 0.18) : Math.round(pop ** 1.4 * 18 * (0.5 + rand()))
    const total = Math.round(wanted * freshness(post, now))
    const posted = Date.parse(post.createdAt)
    const window = Math.min(now - posted, REPLY_WINDOW)
    const times = Array.from({ length: total }, () => rand() ** 2.2).sort((a, b) => a - b)
    const said = new Set()
    const spoke = new Set()
    const unused = (list) => {
      for (let tries = 0; tries < 6; tries += 1) {
        const line = pick(list)
        if (!said.has(line)) { said.add(line); return line }
      }
      return pick(list)
    }
    times.forEach((fraction, i) => {
      const createdAt = clock.iso(Math.round(posted + window * (0.02 + 0.96 * fraction)))
      const base = { id: nextId(), postId: post.id, createdAt }
      const roll = rand()
      if (i > 0 && roll < 0.2) return db.comments.push({ ...base, authorId: author.id, text: unused(copy.REPLIES) })
      const pool = rand() < 0.7 && followers.length ? followers : db.users.map(u => u.id)
      // people rarely comment twice in one thread
      const others = pool.filter(id => id !== author.id)
      const authorId = pick(others.filter(id => !spoke.has(id)).length ? others.filter(id => !spoke.has(id)) : others)
      if (!authorId) return null
      spoke.add(authorId)
      if (roll < 0.32) return db.comments.push({ ...base, authorId, text: unused(copy.REACTIONS) })
      if (roll < 0.4) return db.comments.push({ ...base, authorId, text: `${mention(author.username)} ${unused(copy.TO_AUTHOR)}` })
      if (roll < 0.43) {
        const line = unused(copy.WITH_PICTURE)
        const picture = { kind: 'image', seed: `comment-${base.id}`, alt: '', width: 900, height: 600 }
        return db.comments.push({ ...base, authorId, text: line, regions: [{ kind: 'text', text: line }, picture] })
      }
      return db.comments.push({ ...base, authorId, text: unused(copy.COMMENTS) })
    })
  })
}

const addLoves = (db, { rand, now }, heat) => {
  db.posts.forEach((post) => {
    const pop = heat.get(post.id)
    if (pop === undefined) return
    const settled = 0.25 + 0.75 * freshness(post, now)
    db.users.forEach((user) => {
      if (user.id === post.authorId) return
      const follows = db.follows.some(f => f.followerId === user.id && f.followeeId === post.authorId)
      if (rand() < (0.03 + 0.75 * pop) * settled * (follows ? 1.25 : 0.8)) db.loves.push({ userId: user.id, postId: post.id })
    })
  })
}

// Reposts of work that did well, some with a note on top. ada reposts nothing here: the viewer's own
// reposts come from the notification seed and from using the app.
const addReposts = (db, { rand, now, nextId }, heat) => {
  const pick = list => list[Math.floor(rand() * list.length)]
  const sources = db.posts.filter(p => heat.get(p.id) > 0.2 && now - Date.parse(p.createdAt) > 3 * clock.HOUR)
  const taken = new Set()
  copy.REPOST_NOTES.forEach((note, i) => {
    const source = pick(sources)
    const reposter = pick(db.users.filter(u => u.id !== '1' && u.id !== source.authorId))
    const token = `rp${i}x${Math.floor(rand() * 9000 + 1000)}`
    const fraction = 0.1 + rand() * 0.8
    if (taken.has(`${reposter.id}:${source.id}`)) return
    taken.add(`${reposter.id}:${source.id}`)
    const posted = Date.parse(source.createdAt)
    const repost = {
      id: nextId(), token, authorId: reposter.id,
      createdAt: clock.between(posted, Math.min(now, posted + REPLY_WINDOW), fraction),
      regions: note ? [{ kind: 'text', data: `<p>${note}</p>` }] : [], categoryIds: [], views: 20 + Math.floor(rand() * 400),
      repostOfId: source.id,
    }
    db.posts.push(repost)
    db.users.forEach((user) => {
      if (user.id !== reposter.id && rand() < 0.07) db.loves.push({ userId: user.id, postId: repost.id })
    })
    if (rand() < 0.35) {
      const commenter = pick(db.users.filter(u => u.id !== reposter.id))
      const at = Date.parse(repost.createdAt)
      db.comments.push({ id: nextId(), postId: repost.id, authorId: commenter.id, createdAt: clock.between(at, Math.min(now, at + clock.DAY), 0.3), text: pick(copy.COMMENTS) })
    }
  })
  db.repostsSeeded = true // reposts.js would otherwise add its own five, dated for the old fixed calendar
}

module.exports = { addPeople, addFollows, addComments, addLoves, addReposts, QUIET_FOLLOWERS }
