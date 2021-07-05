var url = require('url');
var adr = 'http://localhost:8080/default.htm?year=2017&month=february';
var q = url.parse(adr, true);
var fs = require('fs');

console.log(q.host); //returns 'localhost:8080'
console.log(q.pathname); //returns '/default.htm'
console.log(q.search); //returns '?year=2017&month=february'

var qdata = q.query; //returns an object: { year: 2017, month: 'february' }
console.log(qdata.month); //returns 'february'

function pageMakr(obj) {
    for (let [key, value] of Object.entries(obj)) {
        let template = `<!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${key.toUpperCase()}</title>
        </head>

        <body>
        <h1>${key.toUpperCase()}</h1>
        <p>I love ${value.feature} in the ${key} time</p>
        </body>

        </html>`;

        fs.writeFile(`${key}.html`, template, function (err) {
            if (err) throw err;
            console.log(`${key} done!`);
        });

        console.log(template);
    }
}

let seasons = {
    summer: {
        feature: 'sun',
    },

    winter: {
        feature: 'snow',
    },
};

pageMakr(seasons);
