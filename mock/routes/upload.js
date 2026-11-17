/* eslint-disable */
// S3-compatible upload target. The app asks /assets/credentials, then POSTs a multipart
// form (key, file, ...) to credentials.endpoint and expects 201; the file must then be
// fetchable at `${endpoint}/${key}`.
const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const { imageSize } = require('image-size')
const { UPLOADS } = require('../db')
const { HOST } = require('../media')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } })
const ENDPOINT = `${HOST}/mock-s3`

router.get('/api/v2/assets/credentials', (req, res) => res.json({
  credentials: { access_key: 'mock', policy: 'mock', signature: 'mock', prefix: 'uploads', endpoint: ENDPOINT },
}))

router.post('/mock-s3', upload.single('file'), (req, res) => {
  const { key = '' } = req.body
  const parts = decodeURIComponent(key).split('/')
  const safe = parts.length === 2 && parts.every(p => /^[\w.-]+$/.test(p) && !['.', '..'].includes(p))
  if (!req.file || !safe) return res.status(400).type('xml').send('<Error><Code>InvalidArgument</Code></Error>')
  fs.mkdirSync(path.join(UPLOADS, parts[0]), { recursive: true })
  fs.writeFileSync(path.join(UPLOADS, ...parts), req.file.buffer)
  console.log(`  upload: ${key} (${req.file.mimetype}, ${Math.round(req.file.size / 1024)}KB)`)
  return res.status(201).type('xml').send(
    `<PostResponse><Location>${ENDPOINT}/${key}</Location><Key>${key}</Key></PostResponse>`)
})

router.use('/mock-s3', express.static(UPLOADS))

// Dimensions of an uploaded file, given the URL the app stored for it
const dimensionsOf = (url) => {
  if (!String(url).startsWith(`${ENDPOINT}/`)) return null
  try {
    const rel = decodeURIComponent(url.slice(ENDPOINT.length + 1))
    const { width, height } = imageSize(fs.readFileSync(path.join(UPLOADS, rel)))
    return { width, height }
  } catch (e) { return null }
}

module.exports = { router, dimensionsOf, ENDPOINT }
