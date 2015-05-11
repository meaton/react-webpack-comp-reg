/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpak-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */

'use strict';
var webpack = require('webpack');
var bower_dir = __dirname + '/bower_components';

var config = {
  addVendor: function(name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp(path));
  },

  output: {
    filename: 'main.js',
    publicPath: '/assets/'
  },

  cache: true,
  debug: true,
  devtool: false,
  entry: [
      'webpack-dev-server/client?http://localhost:8000',
      'webpack/hot/only-dev-server',
      './src/scripts/components/main.jsx'
  ],

  stats: {
    colors: true,
    reasons: true
  },

  resolve: {
    alias: {},
    extensions: ['', '.js', '.jsx']
  },

  module: {
    noParse: [],
    preLoaders: [{
      test: '\\.js$',
      exclude: 'node_modules',
      loader: 'jshint'
    }],
    loaders: [{
      test: /\.jsx$/,
      loader: 'react-hot!jsx-loader?harmony'
    }, {
      test: /\.json/,
      loader: 'json-loader'
    }, {
      test: /\.sass/,
      loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader?limit=8192'
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]

};

//config.addVendor('google-code-prettify', bower_dir + '/google-code-prettify/bin/prettify.min.js');
//config.addVendor('prismjs', bower_dir + '/prismjs/prism.min.js');

module.exports = config;
