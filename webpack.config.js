const mode = process.env.WEBPACK_MODE || 'development'
const pkg = require('./package.json')

module.exports = {
  mode,
  entry: './src/index.js',
  output: {
    filename: mode === 'development' ? 'sdk.dev.js' : `sdk-v${pkg.version}.js`,
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [{
      loader: 'babel-loader'
    }]
  },
  devtool: 'sourcemap',
}