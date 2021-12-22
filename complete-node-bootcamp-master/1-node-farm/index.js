const fs = require('fs');
const http = require('http');

//synchronous way

/* const textIn = fs.readFileSync('./starter/txt/input.txt', 'utf-8');

console.log(textIn);

const textOut = 'Heyo yayayaya';
const newFile = './starter/txt/ouput.txt';

fs.writeFileSync(newFile, textOut);
console.log(`"${textOut}" has been written to path : ${newFile}`) */

//asynchronous way

/* fs.readFile('./starter/txt/start.txt', 'utf-8', (err, data1) => {
    fs.readFile(`./starter/txt/${data1}.txt`, 'utf-8', (err, data2) => {
        fs.readFile(`./starter/txt/append.txt`, 'utf-8', (err, data3) => {
            console.log(data3);

            fs.writeFile('./starter/txt/outputbis.txt', `${data2} \n ${data3}`, 'utf-8', (err, data4) => {
                console.log('done');
            });
        });
    });
});

console.log('read-first'); */

//SERVER

const server = http.createServer((req, res) => {
    console.log(res);
    res.end('yellowwuw');
})

server.listen(8000, () => {
    console.log('re')
})