/* eslint-disable */
// Onboarding for the mock: following categories (and the people who post in them) and the web onboarding version.
// Pure: takes the db.
const content = () => require('./content')

const validCategoryIds = ids => [...new Set((Array.isArray(ids) ? ids : []).map(String))]
  .filter(id => content().categories.some(c => c.id === id))

// The most active authors in the categories, standing in for the "featured" users the real API follows.
const featuredAuthors = (db, categoryIds, excludeId, limit = 5) => {
  const counts = new Map()
  db.posts.filter(p => (p.categoryIds || []).some(id => categoryIds.includes(String(id))) && p.authorId !== excludeId)
    .forEach(p => counts.set(p.authorId, (counts.get(p.authorId) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0])).slice(0, limit).map(([id]) => id)
}

// PUT /api/v2/profile/followed_categories { followed_category_ids, disable_follows }
const followCategories = (db, me, body = {}) => {
  const ids = validCategoryIds(body.followed_category_ids)
  me.followedCategoryIds = ids
  const followed = []
  if (!body.disable_follows) {
    featuredAuthors(db, ids, me.id).forEach((authorId) => {
      if (!db.follows.some(f => f.followerId === me.id && f.followeeId === authorId)) {
        db.follows.push({ followerId: me.id, followeeId: authorId })
        followed.push(authorId)
      }
    })
  }
  return { followedCategoryIds: ids, followed }
}

// What the profile and the token report as `web_onboarding_version`. Seeded users never onboarded but count as done (3).
const onboardingVersion = user => (user.webOnboardingVersion === undefined ? 3 : user.webOnboardingVersion)

module.exports = { followCategories, featuredAuthors, validCategoryIds, onboardingVersion }
