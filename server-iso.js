/* eslint-disable max-len */
import 'newrelic'
import 'babel-polyfill'
import 'isomorphic-fetch'
import heapdump from 'heapdump'

function handleZlibError(error) {
  if (error.code === 'Z_BUF_ERROR') {
    console.error(error)
  } else {
    console.log(error.stack)
    throw error
  }
}
process.on('uncaughtException', handleZlibError)

import express from 'express'
import morgan from 'morgan'
import throng from 'throng'
import librato from 'librato-node'
import path from 'path'
import fs from 'fs'
import React from 'react'
import Helmet from 'react-helmet'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, match, RouterContext } from 'react-router'
import { Provider } from 'react-redux'
import { createElloStore } from './src/store'
import { updateStrings as updateTimeAgoStrings } from './src/vendor/time_ago_in_words'
import addOauthRoute from './oauth'
import createRoutes from './src/routes'
import { replace, syncHistoryWithStore } from 'react-router-redux'

// load env vars first
require('dotenv').load({ silent: process.env.NODE_ENV === 'production' })
global.ENV = require('./env')
updateTimeAgoStrings({ about: '' })

const app = express()

// Log requests with Morgan
app.use(morgan('combined'))

// Send stats to Librato
librato.configure({ email: process.env.LIBRATO_EMAIL,
                    token: process.env.LIBRATO_TOKEN })
librato.start()
app.use(librato.middleware())

librato.on('error', (err) => {
  console.log('ELLO LIBRATO ERROR', err)
})

let indexStr = ''
// grab out the index.html string first thing
fs.readFile(path.join(__dirname, './public/index.html'), 'utf-8', (err, data) => {
  if (!err) {
    indexStr = data
  }
})

// Wire up OAuth route
addOauthRoute(app)

// Assets
app.use(express.static('public'))
app.use('/static', express.static('public/static'))

// Return promises for initial loads
function preRender(renderProps, store) {
  const promises = renderProps.components.map(component => (component && component.preRender) ? component.preRender(store, renderProps) : null).filter(component => !!component)
  return Promise.all(promises)
}

function renderFromServer(req, res) {
  const memoryHistory = createMemoryHistory(req.originalUrl)
  const store = createElloStore(memoryHistory)
  const routes = createRoutes(store)
  const history = syncHistoryWithStore(memoryHistory, store)

  match({ history, routes, location: req.url }, (error, redirectLocation, renderProps) => {
    // populate the rouer store object for initial render
    if (error) {
      console.log('ELLO MATCH ERROR', error)
    } else if (redirectLocation) {
      console.log('ELLO HANDLE REDIRECT', redirectLocation)
      res.redirect(redirectLocation.pathname)
      return
    } else if (!renderProps) { return }
    store.dispatch(replace(renderProps.location.pathname))

    preRender(renderProps, store).then(() => {
      const InitialComponent = (
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>
      )
      const componentHTML = renderToString(InitialComponent)
      const head = Helmet.rewind()
      const state = store.getState()
      const initialStateTag = `<script id="initial-state">window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>`
      // Add helmet's stuff after the last statically rendered meta tag
      const html = indexStr.replace(
        'content="ie=edge">',
        `content="ie=edge">${head.title.toString()} ${head.meta.toString()} ${head.link.toString()}`
      ).replace('<div id="root"></div>', `<div id="root">${componentHTML}</div>${initialStateTag}`)
      res.send(html)
    }).catch((err) => {
      // this will give you a js error like:
      // `window is not defined`
      console.log('ELLO CATCH ERROR', err)
    })
  })
}

const loggedOutPaths = {
  explore: /^\/explore/,
  explore_recent: /^\/explore\/recent/,
  explore_trending: /^\/explore\/trending/,
  find: /^\/find$/,
  forgot_password: /^\/forgot-password/,
  signup: /^\/signup/,
}

if (process.env['ENABLE_ISOMORPHIC_RENDERING']) {
  app.use((req, res) => {
    let isLoggedOutPath = false
    for (const re in loggedOutPaths) {
      if (req.url.match(loggedOutPaths[re])) {
        isLoggedOutPath = true
        break
      }
    }
    console.log('ELLO START URL', req.url, isLoggedOutPath)
    renderFromServer(req, res)
  })
} else {
  app.use((req, res) => {
    res.send(indexStr)
  })
}

if (process.env.ENABLE_HEAPDUMP) {
  process.on('SIGUSR2', function () {
    try {
      global.gc()
    } catch (e) {
      process.exit()
    }
    heapdump.writeSnapshot()
  })
}

const port = process.env.PORT || 6660
const workers = process.env.WEB_CONCURRENCY || 1;
const start = (workerId) => {
  app.listen(port, (err) => {
    if (err) {
      console.log(err)
      return
    }
    if (process.env.ENABLE_HEAPDUMP) {
      try {
        global.gc()
      } catch (e) {
        console.log('need to run with --expose-gc')
        process.exit()
      }

      heapdump.writeSnapshot()
    }
    console.log('Worker ' + workerId + ' listening at http://localhost:' + port)
  })
}

if (workers > 1) {
  throng(start, {
    workers: workers,
    lifetime: Infinity,
  })
} else {
  start(1)
}
