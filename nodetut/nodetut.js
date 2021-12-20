var http = require('http');
var url = require('url');

var dt = require('./moduleone');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  let f = url.parse(req.url,true).query;
  res.write(JSON.stringify(f));
  res.end('Hello World!');
}).listen(8080);



