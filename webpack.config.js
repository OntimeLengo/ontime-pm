const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

  entry: {
    index: './src/index'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    globalObject: "this",
    libraryTarget: 'umd',
    library: 'ontime-pm',
    umdNamedDefine: true
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {          
      'dexie': path.resolve(__dirname, './node_modules/dexie')
    }
  },

  externals: {      
    dexie: {
      commonjs: "dexie",
      commonjs2: "dexie",
      amd: "dexie",
      root: "dexie"
    }
  },

  plugins: [
    // new CleanWebpackPlugin()
  ]
};
