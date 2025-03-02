const path = require('path');

module.exports = {
  mode: 'production', // Or 'development' if you're actively debugging
  entry: './src/preload/preload.ts',
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, 'build', 'preload'),
    filename: 'preload.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
