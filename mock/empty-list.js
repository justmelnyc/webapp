/* eslint-disable */
// The v2 API answers a search that finds nothing with `204 No Content`, not with an empty list. The original
// app depends on it: a 204 gives its stream an empty result (the "Sorry, no results found." zero state),
// while `200 { posts: [] }` makes it draw one empty post instead.
// -> true when the answer was sent
const noContentWhenEmpty = (res, count) => {
  if (count > 0) return false
  res.status(204).end()
  return true
}

module.exports = { noContentWhenEmpty }
