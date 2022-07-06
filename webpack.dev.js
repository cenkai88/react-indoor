const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    main: './index.js',
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
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: {
          inline: 'no-fallback',
        }
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
    new DefinePlugin({
      pageTitle: JSON.stringify('react-indoor DEMO'),
      HTTP_BASE: JSON.stringify('http://47.92.31.84/op'),
      AAA_BASE: JSON.stringify('http://47.92.31.84/aaa'),
    }),
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