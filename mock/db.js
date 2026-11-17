/* eslint-disable */
// In-memory store persisted to mock/.data/db.json so posts and uploads survive restarts.
// Delete mock/.data (or run `yarn mock:reset`) to start over from the seed data.
const fs = require('fs')
const path = require('path')
const { build } = require('./seed')

const DIR = path.join(__dirname, '.data')
const FILE = path.join(DIR, 'db.json')
const UPLOADS = path.join(DIR, 'uploads')

fs.mkdirSync(UPLOADS, { recursive: true })

const load = () => {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch (e) { return build() }
}

const db = load()
let timer = null

const save = () => {
  clearTimeout(timer)
  timer = setTimeout(() => fs.writeFileSync(FILE, JSON.stringify(db)), 200)
}

const nextId = () => String(++db.seq)
const userById = id => db.users.find(u => u.id === String(id))
const postById = id => db.posts.find(p => p.id === String(id))
const postByRef = ref => (String(ref).startsWith('~')
  ? db.posts.find(p => p.token === String(ref).slice(1))
  : postById(ref))
const userByName = name => db.users.find(u => u.username === String(name).replace(/^~/, ''))

module.exports = { db, save, nextId, userById, postById, postByRef, userByName, UPLOADS }
