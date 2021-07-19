const fs = require('fs');

fs.readFile(process.argv[2], 'utf8', function doneReading(err, data) {
    if (err) throw err;
    console.log(data.match(/\n/g).length);
});
