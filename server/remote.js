var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path')
  , Log = require('coloured-log')
  , log = new Log(Log.DEBUG)
  , out;

app.listen(80);

function handler(req, res) {
  var ext, parts, url = req.url;

  url = url.replace(/\?.*/, '');
  if (url === '/') {
    url = '/index.html';
  }

  parts = url.split('.');
  ext = parts[parts.length - 1]

  log.info('HTTP: ' + url);
  url = path.normalize(__dirname + '/../public' + url);

  fs.readFile(url, function(error, data) {
    if (error) {
      log.error('Error with: ' + url);
      log.notice(error);
      res.writeHead(500);
      return res.end('Error loading')
    }

    switch(ext) {
      case 'html':
        res.setHeader('Content-Type', 'text/html');
        break;
      case 'js':
        res.setHeader('Content-Type', 'application/javascript');
        break;
      case 'css':
        res.setHeader('Content-Type', 'text/css');
        break;
      case 'svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
    }

    res.writeHead(200);
    res.end(data);
  });
}