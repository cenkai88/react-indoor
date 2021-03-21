const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const cleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './index.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: './static/[name]_[contentHash:10].js',
    publicPath: '/react-indoor/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: {
          inline: 'no-fallback',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss/,
        exclude: /node_modules|src\/assets\/common\.scss/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: [/\.gif$/, /\.png$/, /\.jpe?g$/, /\.svg/],
        exclude: /node_modules/,
        loader: 'url-loader',
        options: {
          limit: 8000,
        },
      },
      {
        test: /\.glsl$/,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [
    new cleanWebpackPlugin(['dist'], { root: __dirname, verbose: true }),
    new HtmlWebpackPlugin({
      template: './public/index.ejs',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin([{
      from: './demo/assets/icons',
      to: 'icons',
    }]),
  ],
};