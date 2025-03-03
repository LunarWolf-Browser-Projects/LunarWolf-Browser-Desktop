const path = require('path');

module.exports = {
  entry: './src/renderer/renderer.ts',
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
          filename: (pathData) => {
            if (pathData.module.resource.includes('tabview-icons')) {
              return 'tabview-icons/[name][ext]';
            } else if (pathData.module.resource.includes('toolbar-icons')) {
              return 'toolbar-icons/[name][ext]';  // Make sure the toolbar icons go to the correct location
            }
          }
        }
      }
    ]
  },
  mode: 'development',
  devServer: {
    static: path.join(__dirname, 'build'),
    hot: true,
  }
};
