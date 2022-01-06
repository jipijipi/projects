const { rejects } = require('assert');
const fs = require('fs');
const superagent = require('superagent');

const readFilePromise = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject(`${err} cant find shit`);
            resolve(data);
        })
    });
}

const writeFilePromise = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, err => {
            if (err) reject('cant just');
            resolve('success');
        })
    })
}

const getDogPic = async () => {

    try {

        const data = await readFilePromise(`${__dirname}/starter/dog.txt`);
        console.log(`${data}`);

        const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        console.log(res.body.message);

        await writeFilePromise('dog-img.txt', res.body.message);
        console.log('all gud');

    } catch (err) {

        console.log(err.message);

    }
}

getDogPic();

// readFilePromise(`${__dirname}/starter/dog.txt`).then(data => {

//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
// })
//     .then(res => {

//         console.log(res.body.message);

//         return writeFilePromise('dog-img.txt', res.body.message);

//     })

//     .then(() => {
//         console.log('it works');
//     })

//     .catch(err => {
//         console.log(err.message);
//     });


