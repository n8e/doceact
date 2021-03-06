(function() {
  'use-strict';
  if (!process.env.NODE_ENV) {
    require('dotenv').load();
  }

  /* eslint no-console: 0 */
  var path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    webpack = require('webpack'),
    config = require('./server/config'),
    webpackMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    webpackConfig = require('./webpack.config.js'),
    isDeveloping = process.env.NODE_ENV !== 'production',
    port = config.port,
    app = express();

  var api = require('./server/routes/index')(app, express);;

  if (isDeveloping) {
    const compiler = webpack(webpackConfig);
    const middleware = webpackMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      contentBase: 'src',
      stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
      }
    });
    mongoose.connect(config.mongodb.url, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Server connected to the database.');
      }
    });

    app.use(middleware);
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(bodyParser.json());
    app.use(webpackHotMiddleware(compiler));
    app.use('/api', api);
    app.get('*', function(req, res) {
      res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
      res.end();
    });
  } else {
    app.use(express.static(__dirname + '/dist'));
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', function(err) {
    if (err) {
      console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
  });
})();
