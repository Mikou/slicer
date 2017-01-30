const webpack              = require('webpack');
const express              = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig        = require('../config/webpack.js');
const bodyParser           = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 8082;
const router = express.Router(); 

const compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
              stats: {colors: true}
}));

app.use(webpackHotMiddleware(compiler, {
  log: console.log
}))

app.listen(port);

