const path = require('path');

module.exports = {
  mode: 'production', // Or 'development' if you're actively debugging
  entry: {
    preload: './src/preload/preload.ts', // Main preload script
    toolbarpreload: './src/preload/toolbarpreload.ts', // Toolbar preload script
  },
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, 'build', 'preload'),
    filename: '[name].js', // Outputs preload.js and toolbarPreload.js
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};