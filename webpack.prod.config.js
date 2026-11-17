/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { postcssLoader, babelRule, definedEnv } = require('./webpack.common')
const UploadHTMLPlugin = require('./src/server/upload_html_plugin')

// load env vars first
require('dotenv').config({ quiet: true })

// Usage: webpack --config webpack.prod.config.js --env commitsha=<sha>
module.exports = (env = {}) => {
  const version = env.commitsha || 'dev'
  const plugins = [
    new webpack.DefinePlugin(definedEnv('production')),
    new MiniCssExtractPlugin({ filename: `${version}.css` }),
    new HtmlWebpackPlugin({
      filename: `${version}.html`,
      chunks: ['main'],
      template: 'public/template.html',
      inject: 'body',
    }),
    {
      apply: (compiler) => {
        compiler.hooks.done.tap('WebpackStats', (stats) => {
          const dir = path.join(__dirname, 'webpack-stats')
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.join(dir, 'prod.json'), JSON.stringify(stats.toJson()))
        })
      },
    },
  ]

  // Only upload when a serve endpoint is configured. Static assets are no longer
  // pushed to S3 by webpack: sync public/static to your bucket in the deploy step.
  if (process.env.APEX_SERVE_ENDPOINT) {
    plugins.push(new UploadHTMLPlugin({
      endpoint: process.env.APEX_SERVE_ENDPOINT,
      username: process.env.APEX_SERVE_USERNAME,
      password: process.env.APEX_SERVE_PASSWORD,
    }))
  }

  return {
    mode: 'production',
    devtool: 'source-map',
    entry: { main: './src/main' },
    output: {
      filename: `${version}.js`,
      chunkFilename: '[id].chunk.js',
      path: path.join(__dirname, 'public/static'),
      publicPath: `${(process.env.CDN || '')}/`,
    },
    optimization: { emitOnErrors: false },
    plugins,
    module: {
      rules: [
        babelRule,
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', postcssLoader],
        },
      ],
    },
  }
}
