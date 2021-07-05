const http = require('http');
const url = require('url');
const fs = require('fs');

const host = 'localhost';
const port = 8080;

const requestListener = function (req, res) {
    filename = req.url + '.html';
    console.log(filename);
    fs.readFile(filename.substring(1), function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
