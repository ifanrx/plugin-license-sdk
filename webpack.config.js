const mode = process.env.WEBPACK_MODE || 'development'
const pkg = require('./package.json')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode,
  entry: './src/index.js',
  output: {
    path: mode === 'development' ? path.join(__dirname, 'tmp/plugin') : path.join(__dirname, 'dist'),
    filename: mode === 'development' ? 'sdk.dev.js' : `sdk-v${pkg.version}.js`,
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [{
      loader: 'babel-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.version': JSON.stringify(pkg.version),
    }),
  ],
  devtool: 'sourcemap',
}