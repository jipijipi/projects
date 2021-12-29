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

const replaceProduct(temp, product){
    let output = temp.replace(/{{PRODUCTNAME}}/g, product.productName);
    output = output.replace(/{{IMAGE}}/g, product.image);
    output = output.replace(/{{PRICE}}/g, product.price);
    output = output.replace(/{{ORIGIN}}/g, product.origin);
    output = output.replace(/{{NUTRIENTS}}/g, product.nutrients);
    output = output.replace(/{{QUANTITY}}/g, product.quantity);
    output = output.replace(/{{DESCRIPTION}}/g, product.description);
    output = output.replace(/{{ID}}/g, product.id);

    if (!product.organic) output = output.replace(/{{NOT_ORGANIC}}/g, 'not-organic');
    return output;
}

const tempProduct = fs.readFileSync(`${__dirname}/starter/templates/template-product.html`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/starter/templates/template-overview.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8');
const productData = JSON.parse(data);

const server = http.createServer((req, res) => {
    console.log(req.url);

    const pathName = req.url;

    //overview page
    if (pathName == '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });

        const productCards = productData.map(x => replaceProduct(x))
        res.end(tempOverview);

    } else if (pathName == '/api') {
        console.log('reee');
        console.log(productData);
        res.writeHead(200, { 'Content-type': 'application/json' })
        res.end(data);

    } else if (pathName == '/web') {
        console.log('web');
        fs.readFile(`${__dirname}/starter/templates/overview.html`, 'utf-8', (err, data) => {
            res.writeHead(200, { 'Content-type': 'text/html' });
            res.end(data);
        });


    } else {
        res.end(pathName);
    }

    //res.end('yellowwuw');
})

server.listen(8000, () => {
    console.log('re')
})