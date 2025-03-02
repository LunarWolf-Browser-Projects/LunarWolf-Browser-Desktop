const path = require('path');

module.exports = {
  entry: './src/renderer/ui/views/tabview/tabbar.ts',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'renderer.js'
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
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'tabview-icons/[name][ext]'
        }
      }
    ]
  },
  mode: 'development',
  devServer: {
    static: path.join(__dirname, 'build'),
    hot: true, // Enable hot module replacement
  }
};
