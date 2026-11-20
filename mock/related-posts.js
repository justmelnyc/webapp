/* eslint-disable */
// Related posts (the stream under a post on its page): GET /api/v2/posts/:id/related, see routes/related-posts.js.
// Deterministic: the author's other posts first, then posts that share a category, each group newest first.
// Never the post itself, never a repost (a repost of the post would show the same content again).

const DEFAULT_PER_PAGE = 6
const MAX_PER_PAGE = 25

const newestFirst = (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.id < b.id ? -1 : 1)

// A repost has no categories of its own: it is related through the post it reposts
const categoriesOf = (db, post) => {
  const source = post.repostOfId && db.posts.find(p => p.id === post.repostOfId)
  return (source || post).categoryIds || []
}

const relatedPosts = (db, post) => {
  const categories = categoriesOf(db, post)
  const others = db.posts.filter(p => p.id !== post.id && p.id !== post.repostOfId && !p.repostOfId)
  const sameAuthor = others.filter(p => p.authorId === post.authorId).sort(newestFirst)
  const sameCategory = others
    .filter(p => p.authorId !== post.authorId && (p.categoryIds || []).some(id => categories.includes(id)))
    .sort(newestFirst)
  return [...sameAuthor, ...sameCategory]
}

// `per_page` as the original sends it (one row of the grid); anything odd falls back to the default
const perPageOf = (value) => {
  const n = parseInt(value, 10)
  return n > 0 ? Math.min(n, MAX_PER_PAGE) : DEFAULT_PER_PAGE
}

module.exports = { relatedPosts, perPageOf, DEFAULT_PER_PAGE, MAX_PER_PAGE }
