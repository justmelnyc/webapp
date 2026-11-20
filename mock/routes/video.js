/* eslint-disable */
// The clip behind video attachments (see ../video.js). sendFile answers Range requests, which looping needs.
const path = require('path')
const express = require('express')

const router = express.Router()

router.get('/media/loop.mp4', (req, res) => res.sendFile(path.join(__dirname, '..', 'assets', 'loop.mp4')))

module.exports = { router }
