/* eslint-disable */
// Deterministic seed data: the same people, posts and comments on every fresh start.
const PEOPLE = [
  ['ada', 'Ada Lindqvist', 'Generative artist working with plotters and light.', 'Stockholm'],
  ['grace', 'Grace Okonkwo', 'Documentary photographer. Lagos / London.', 'Lagos'],
  ['mara', 'Mara Delgado', 'Illustrator, zine maker, coffee person.', 'Mexico City'],
  ['jules', 'Jules Beaumont', 'Type designer. I draw letters for a living.', 'Lyon'],
  ['theo', 'Theo Nakamura', 'Street photography and film cameras.', 'Osaka'],
  ['noor', 'Noor Haddad', 'Motion designer and sometimes painter.', 'Amman'],
  ['ines', 'Ines Carvalho', 'Fashion editor, collage artist.', 'Lisbon'],
  ['kofi', 'Kofi Mensah', 'Architecture student, concrete enthusiast.', 'Accra'],
  ['saoirse', 'Saoirse Brennan', 'Ceramics and printmaking.', 'Galway'],
  ['luca', 'Luca Ferrante', '3D artist. Mostly clay renders.', 'Milan'],
  ['yuki', 'Yuki Tanaka', 'Watercolors, tiny comics.', 'Kyoto'],
  ['amara', 'Amara Singh', 'Brand designer and part-time muralist.', 'Toronto'],
]

const CAPTIONS = [
  'Early morning light in the studio today.',
  'Finished this one after three weeks. Feedback welcome!',
  'Work in progress. Not sure about the color yet.',
  'Found this on a walk and could not stop looking at it.',
  'New series starting. More soon.',
  'Throwback to last summer.',
  'Tried a different approach this time.',
  'Details from the latest print run.',
  'Quick sketch before breakfast.',
  'Everything is a texture if you look closely enough.',
  'Shot on film, scanned at home.',
  'Experimenting with a limited palette.',
]

const COMMENTS = [
  'This is gorgeous.', 'Love the colors here!', 'How long did this take?',
  'Following for more.', 'The composition is perfect.', 'Wow.', 'This made my day.',
]

const CATEGORIES = ['Art', 'Photography', 'Design', 'Fashion']
const SIZES = [[1200, 800], [900, 1200], [1000, 1000], [1400, 700]]

// small seeded PRNG so seed data is stable
const rng = (seed) => () => {
  seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const build = () => {
  const rand = rng(42)
  const pick = list => list[Math.floor(rand() * list.length)]
  const db = { seq: 1000, users: [], posts: [], comments: [], loves: [], watches: [], follows: [] }

  PEOPLE.forEach(([username, name, bio, location], i) => {
    db.users.push({
      id: String(i + 1), username, name, bio, location, email: `${username}@example.com`,
      links: [], hasCover: rand() > 0.25,
    })
  })

  const start = Date.parse('2026-11-01T12:00:00Z')
  for (let n = 0; n < 48; n += 1) {
    const author = pick(db.users)
    const imageCount = pick([0, 1, 1, 1, 2, 3])
    const regions = [{ kind: 'text', data: `<p>${pick(CAPTIONS)}</p>` }]
    for (let i = 0; i < imageCount; i += 1) {
      const [w, h] = pick(SIZES)
      regions.push({ kind: 'image', data: { url: null, seed: `${author.username}-${n}-${i}` }, width: w, height: h })
    }
    db.posts.push({
      id: String(++db.seq), token: `p${n}x${Math.floor(rand() * 9000 + 1000)}`,
      authorId: author.id, createdAt: new Date(start - n * 5.5 * 3600000).toISOString(),
      regions, categoryIds: [String(1 + Math.floor(rand() * CATEGORIES.length))], views: Math.floor(rand() * 900),
    })
  }

  db.posts.forEach((post) => {
    const commenters = Math.floor(rand() * 4)
    for (let i = 0; i < commenters; i += 1) {
      db.comments.push({
        id: String(++db.seq), postId: post.id, authorId: pick(db.users).id,
        createdAt: new Date(Date.parse(post.createdAt) + (i + 1) * 3600000).toISOString(),
        text: pick(COMMENTS),
      })
    }
    db.users.forEach((u) => { if (u.id !== post.authorId && rand() > 0.8) db.loves.push({ userId: u.id, postId: post.id }) })
  })

  // everyone follows a few people; user 1 (ada) is the default login
  db.users.forEach((u) => {
    db.users.forEach((o) => { if (u.id !== o.id && (rand() > 0.6 || u.id === '1')) db.follows.push({ followerId: u.id, followeeId: o.id }) })
  })
  // curators and category post states (no rand: keeps the seed above unchanged); server.js applies it to older db files too
  require('./category-posts').seedCategoryPosts(db)
  return db
}

module.exports = { build, CATEGORIES }
