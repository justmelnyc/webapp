module.exports = {
  require: ['@babel/register', './test/setup.js'],
  spec: ['test/unit/**/*.js'],
  recursive: true,
  // test files use import syntax; keep Node from loading them as native ESM
  'node-option': ['no-experimental-detect-module'],
}
