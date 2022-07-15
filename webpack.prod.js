const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const cleanWebpackPlugin = require('clean-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'umd',
    libraryExport: 'default',
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
        test: /\.glsl$/,
        loader: 'raw-loader',
      },
      {
        test: /\.mp4$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new cleanWebpackPlugin(['dist'], { root: __dirname, verbose: true }),
    new CopyWebpackPlugin([{
      from: './src/package.src.json',
      to: 'package.json',
    }]),
  ],
  externals: {
    'react': 'react',
  },
};