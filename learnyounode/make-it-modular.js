const mymodule = require('./mymodule');

let dir = process.argv[2];
let ext = process.argv[3];

console.log(dir);
console.log(ext);
console.log(mymodule(dir, ext, null));
