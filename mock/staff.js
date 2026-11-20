/* eslint-disable */
// Ello staff. One seeded user carries `isStaff: true`; the apps read it from GET /api/v2/profile (`isStaff`)
// and from the login token (`is_staff`). Staff may change the roles of every category and every profile,
// delete any comment, and see "Analytics" in their menu. Pure: takes the db.
//
// The flag is put on by a one-time migration (`db.staffSeed`), so it reaches a database made before this
// existed as well as a fresh seed, and taking it away by hand afterwards sticks.
const STAFF_USERNAME = 'saoirse' // has a cover image in both seeds, holds no category role, curates nothing
const STAFF_SEED = 1

// -> true when the db changed
const seedStaff = (db) => {
  if (db.staffSeed === STAFF_SEED) return false
  const user = (db.users || []).find(u => u.username === STAFF_USERNAME)
  if (user) user.isStaff = true
  db.staffSeed = STAFF_SEED
  return true
}

const isStaff = (db, userId) => !!userId && (db.users || []).some(u => u.id === String(userId) && u.isStaff === true)

// What GET /api/v2/profile adds for the viewer
const profileFields = user => ({ isStaff: !!(user && user.isStaff) })

module.exports = { STAFF_USERNAME, STAFF_SEED, seedStaff, isStaff, profileFields }
