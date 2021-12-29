const fs = require('fs');
const http = require('http');
const url = require('url');

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



const tempCard = fs.readFileSync(`${__dirname}/starter/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/starter/templates/template-product.html`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/starter/templates/template-overview.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8');
const productData = JSON.parse(data);

const server = http.createServer((req, res) => {

    console.log(req.url);
    console.log(url.parse(req.url, true));

    const { query, pathname } = url.parse(req.url, true);


    //overview page
    if (pathname == '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });

        const productCards = productData.map(x => replaceTemplate(tempCard, x)).join('');
        const output = tempOverview.replace(/{{PRODUCTCARD}}/g, productCards);
        res.end(output);

    } else if (pathname == '/api') {
        res.writeHead(200, { 'Content-type': 'application/json' })
        res.end(data);

    } else if (pathname == '/web') {
        fs.readFile(`${__dirname}/starter/templates/overview.html`, 'utf-8', (err, data) => {
            res.writeHead(200, { 'Content-type': 'text/html' });
            res.end(data);
        });


    } else if (pathname == '/product') {
        res.writeHead(200, { 'Content-type': 'text/html' });

        const product = productData[query.id];
        const output = replaceTemplate(tempProduct, product);
        console.log(productData);
        console.log(product);
        res.end(output);


    } else {
        res.end(pathname);
    }

    //res.end('yellowwuw');
})

server.listen(8000, () => {
    console.log('re')
})