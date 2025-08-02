module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: 'preact'
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};
