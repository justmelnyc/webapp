/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import webpack from 'webpack'
import { postcssLoader, babelRule, definedEnv } from './webpack.common'

// load env vars first
require('dotenv').config()

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    main: ['./src/main', 'webpack-hot-middleware/client'],
  },
  output: {
    filename: '[name].entry.js',
    path: path.join(__dirname, 'public/static'),
    publicPath: '/static/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin(definedEnv('development')),
  ],
  module: {
    rules: [
      babelRule,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', postcssLoader],
      },
    ],
  },
}
