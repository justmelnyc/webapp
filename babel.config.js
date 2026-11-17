module.exports = (api) => {
  const isTest = api.env('test')
  const isProd = api.env('production')
  return {
    presets: [
      ['@babel/preset-env', isTest
        ? { targets: { node: 'current' } }
        : { useBuiltIns: 'usage', corejs: '3' }],
      ['@babel/preset-react', { runtime: 'classic' }],
      '@babel/preset-flow',
    ],
    plugins: [
      'lodash',
      ...(isProd ? [
        '@babel/plugin-transform-react-constant-elements',
        'transform-react-remove-prop-types',
      ] : []),
    ],
  }
}
