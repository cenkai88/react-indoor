const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './index.js',
    bucketWorker: './src/layers/BucketFactor.js',
  },
  devServer: {
    publicPath: '/',
    compress: true,
    // contentBase: path.join(__dirname, 'src'),
    port: 9002,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]-[hash:base64:10]',
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.glsl$/,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './example/index.ejs',
      filename: 'index.html',
    }),
    // new CopyWebpackPlugin([
    //   {
    //     from: './example/worker',
    //     to: 'worker',
    //   },
    // ]),
  ],
};