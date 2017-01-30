const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
//const HMR = helpers.hasProcessFlag('hot');
const METADATA = {
  title: 'slicer',
  baseUrl: '/',
  host: HOST,
  port: PORT,
  ENV: ENV,
  //HMR: HMR
};
module.exports = {
  entry: {
    'main': './src'
  },
  devtool: 'source-map',
  resolve: {
    modules: [helpers.root('src'), helpers.root('node_modules')]
  },
  output: {
    path: helpers.root('dist'),

    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    library: "slicer",
    libraryTarget: "var"
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'raw-loader',
        exclude: [helpers.root('src/index.html')]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'tests/index.html',
      title: METADATA.title,
      chunksSortMode: 'dependency',
      metadata: METADATA,
      inject: 'head'
    }),
		new UglifyJsPlugin({
			// beautify: true, //debug
			// mangle: false, //debug
			// dead_code: false, //debug
			// unused: false, //debug
			// deadCode: false, //debug
			// compress: {
			//   screw_ie8: true,
			//   keep_fnames: true,
			//   drop_debugger: false,
			//   dead_code: false,
			//   unused: false
			// }, // debug
			// comments: true, //debug

			beautify: false, //prod
			output: {
				comments: false
			}, //prod
			mangle: {
				screw_ie8: true
			}, //prod
			compress: {
				screw_ie8: true,
				warnings: false,
				conditionals: true,
				unused: true,
				comparisons: true,
				sequences: true,
				dead_code: true,
				evaluate: true,
				if_return: true,
				join_vars: true,
				negate_iife: false // we need this for lazy v8
			},
		})
  ]
};

