const fs = require('fs');
const superagent = require('superagent');

const readFilePro = file => {
    return new Promise();
}

fs.readFile(`${__dirname}/starter/dog.txt`, (err, data) => {
    console.log(`Breed : ${data}`);

    superagent.get(`https://dog.ceo/api/breed/${data}/images/random`).then(res => {

        if (err) return

        console.log(res.body.message);

        fs.writeFile('dog-img.txt', res.body.message, x => {
            console.log('file created');
        })

    }).catch(err => {
        console.log(err.message);
    });
})
