const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
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
        test: /\.(png|jpg|jpeg|gif)$/i, // Handle only image files (exclude SVG)
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static/app_loader/app.html', to: 'app.html' },
        { from: 'src/renderer/ui/views/tabview/tabbarstyle.css', to: 'tabbarstyle.css' },
        { from: 'src/renderer/ui/views/tabview/tabview-icons', to: 'tabview-icons' },
        { from: 'src/renderer/ui/views/toolbar/toolbar-icons', to: 'assets/toolbar-icons' }
      ]
    })
  ],
  devServer: {
    static: path.join(__dirname, 'build'),
    hot: true,
    port: 3000
  }
};
