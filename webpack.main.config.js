const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // Set mode to development for fast builds
  entry: './src/main.ts',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'lunarwolf-web-browser.js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.css']
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
        test: /\.(svg|png|jpg|jpeg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static/app_loader/app.html', to: 'app.html' },
        { from: 'src/renderer/ui/views/tabview/tabbarstyle.css', to: 'tabbarstyle.css' },
        { from: 'src/renderer/ui/views/tabview/tabview-icons', to: 'tabview-icons' }
      ]
    })
  ],
  devServer: {
    static: path.join(__dirname, 'build'),
    hot: true, // Enable hot module replacement
    port: 3000 // Choose the port you want to use
  }
};
