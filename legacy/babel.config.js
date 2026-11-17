module.exports = (api) => {
  const isTest = api.env('test')
  const isProd = api.env('production')
  return {
    presets: [
      ['@babel/preset-env', isTest ? { targets: { node: 'current' } } : {}],
      ['@babel/preset-react', { runtime: 'classic' }],
      '@babel/preset-flow',
    ],
    plugins: [
      'lodash',
      ...(isTest ? [] : [['polyfill-corejs3', { method: 'usage-global', version: '3.51.0' }]]),
      ...(isProd ? [
        '@babel/plugin-transform-react-constant-elements',
        'transform-react-remove-prop-types',
      ] : []),
    ],
  }
}
