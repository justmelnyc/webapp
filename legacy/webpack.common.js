/* eslint-disable import/no-extraneous-dependencies */
// Pieces shared by webpack.dev.config.js and webpack.prod.config.js
const path = require('path')
const autoprefixer = require('autoprefixer')
const postcssApply = require('postcss-apply')
const postcssCalc = require('postcss-calc')
const postcssColorFunction = require('postcss-color-function')
const postcssCustomMedia = require('postcss-custom-media')
const postcssCustomProperties = require('postcss-custom-properties')
const postcssImport = require('postcss-import')
const postcssPxToRem = require('postcss-pxtorem')
const postcssReporter = require('postcss-reporter')
const postcssUrl = require('postcss-url')

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        postcssImport(),
        postcssUrl(),
        postcssCustomProperties({ preserve: false }),
        postcssApply(),
        postcssCalc(),
        postcssColorFunction(),
        postcssCustomMedia(),
        postcssPxToRem({ propList: ['*'], minPixelValue: 5 }),
        autoprefixer(),
        postcssReporter(),
      ],
    },
  },
}

const babelRule = {
  test: /\.js$/,
  include: path.join(__dirname, 'src'),
  use: 'babel-loader',
}

// the app reads these from process.env at build time (see env.js)
const ENV_KEYS = [
  'APP_DEBUG',
  'AUTH_CLIENT_ID',
  'AUTH_CLIENT_SECRET',
  'AUTH_DOMAIN',
  'LOGO_MARK',
  'PROMO_HOST',
  'SEGMENT_WRITE_KEY',
  'USE_LOCAL_EMOJI',
]

const definedEnv = (nodeEnv) => {
  const defined = { NODE_ENV: JSON.stringify(nodeEnv) }
  ENV_KEYS.forEach((key) => { defined[key] = JSON.stringify(String(process.env[key])) })
  defined.API_DOMAIN = JSON.stringify(String(process.env.API_DOMAIN || process.env.AUTH_DOMAIN))
  return { 'process.env': defined }
}

module.exports = { postcssLoader, babelRule, definedEnv }
