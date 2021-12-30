const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();

setTimeout(() => console.log('T1 done'), 0);
setImmediate(() => console.log('Immediate 1 done'));

fs.readFile('./starter/test-file.txt', () => {

    setTimeout(() => console.log('T2 done'), 0);
    setTimeout(() => console.log('T3 done'), 3000);
    setImmediate(() => console.log('Immediate 2 done'));
    console.log('I/O done')

    process.nextTick(() => console.log('process NT done'));

    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'password encrypted')
    });
});

console.log('Hello from top level');