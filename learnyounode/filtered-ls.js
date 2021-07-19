const fs = require('fs');

let extension = process.argv[3];
let regex = new RegExp(`\\.${extension}$`, 'g');

fs.readdir(process.argv[2], function dirRed(err, data) {
    if (err) throw err;
    let filteredArr = data.filter((x) => x.match(regex));
    filteredArr.map((x) => console.log(x));
});
