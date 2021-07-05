var http = require('http');
var url = require('url');
var fs = require('fs');

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(req.url + ' - ');
    // var q = url.parse(req.url, true).query;
    // var q = new URL(req.url);
    // console.log(q);
    // var txt = q.year + " " + q.month;
    res.end();
}).listen(8080);

