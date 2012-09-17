var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path')
  , Log = require('coloured-log')
  , log = new Log(Log.DEBUG)
  , ids;

// For production.
app.listen(80);

// Tell socket.io to shut up
io.set('log level', 1);

// A simple http server
function handler(req, res) {
  var ext, parts, url = req.url;

  // Are we serving index?
  url = url.replace(/\?.*/, '');
  if (url === '/') {
    url = '/index.html';
  }

  // Get file extension
  parts = url.split('.');
  ext = parts[parts.length - 1];

  //log.info('HTTP: ' + url);
  url = path.normalize(__dirname + '/../public' + url);

  fs.exists(url, function(exists) {
    if (exists) {
      fs.readFile(url, function(error, data) {
        // Oh noes!
        if (error) {
          log.error('Error with: ' + url);
          log.notice(error);
          res.writeHead(500);
          return res.end('Error loading');
        }

        // Chrome likes mime types, apparently
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
    } else {
      log.notice('404: ' + url);
      res.writeHead(400);
      res.end('Not found. :(');
    }
  });
}


// Generate a list of IDs for remotes to use. This is a kind of stupid way of doing
// things as we're limited to 10k concurrent connections, but we're not likely to
// exceed that anyway.
//
// This uses the Fisher-Yates shuffle:
// http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle

ids = [];

// Get a list of 0000 to 9999
for(var i = 0; i < 10000; i++) {
  ids[i] = ("0000" + i).substr(-4);
}
// Shuffle them!
var tmp;
for(i = 0; i < 10000; i++) {
  j = Math.round(Math.random() * i);
  tmp = ids[j];
  ids[j] = ids[i];
  ids[i] = tmp;
}

io.sockets.on('connection', function(socket) {

  // For remotes
  socket.on('new remote', function() {
    // Allocate this remote a pin number
    pin = ids[0];
    ids.push(ids.shift());

    log.info('Remote connected with pin ' + pin);

    // Join that pins room
    socket.join(pin);
    socket.emit('accept', pin);

    socket.on('remote', function(data) {
      io.sockets.in(pin).emit('remote', data);
    });
  });

  // For clients
  socket.on('new client', function(pin) {
    log.info('Client attempting to connect to ' + pin);
    if(io.sockets.manager.rooms['/' + pin] && io.sockets.manager.rooms['/' + pin].length !== 0) {
      socket.emit('accept');
      socket.join(pin);

      log.info('Connected');

      socket.on('client', function(data) {
        io.sockets.in(pin).emit('client', data);
      });
    } else {
      socket.emit('deny');
      log.notice('Pin ' + pin + ' does not exist.');
    }
  });
});