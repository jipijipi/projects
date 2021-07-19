const fs = require('fs');

let file = process.argv[2];

let fileContent = fs.readFileSync(file).toString();

console.log(fileContent.match(/\n/g).length);
