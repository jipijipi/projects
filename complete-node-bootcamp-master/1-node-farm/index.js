const fs = require('fs');

const textIn = fs.readFileSync('./starter/txt/input.txt','utf-8');

console.log(textIn);

const textOut = 'Heyo yayayaya';
const newFile = './starter/txt/ouput.txt';

fs.writeFileSync(newFile,textOut);
console.log(`"${textOut}" has been written to path : ${newFile}`)