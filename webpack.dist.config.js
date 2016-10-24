/*
 * Webpack distribution configuration
 *
 * This file is set up for serving the distribution version. It will be compiled to dist/ by default
 */

'use strict';

var webpack = require('webpack');

module.exports = {

  entry: './src/scripts/app/app.jsx',

  output: {
    publicPath: '/assets/',
    path: 'dist/assets/',
    filename: 'main.js'
  },

  console: false,
  debug: false,
  devtool: false,

  stats: {
    colors: true,
    modules: true,
    reasons: false
  },

  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  
  resolve: {
    alias: {
      'lodash/cloneDeep$': 'lodash/lang/cloneDeep',
      'lodash/get$': 'lodash/object/get',
      'lodash/has$': 'lodash/object/has',
      'lodash/isEqual$': 'lodash/lang/isEqual',
      'lodash/find$': 'lodash/collection/find'
    },
    extensions: ['', '.js', '.jsx']
  },

  module: {
    preLoaders: [{
      test: '\\.js$',
      exclude: 'node_modules',
      loader: 'jshint'
    }],

    loaders: [{
      test: /\.jsx$/,
      loader: 'jsx-loader?harmony'
    }, {
      test: /\.json/,
      loader: 'json-loader'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(sass|scss)/,
      loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader?limit=8192'
    }]
  }
};
