const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json())

// app.get('/', (req, res) => {
//     res.status(418).json({ message: 'Hello from the other side', app: 'Natours', })
// })

// app.post('/', (req, res) => {
//     res.send('You can post here');
// })

const tours = JSON.parse(fs.readFileSync(`${__dirname}/starter/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'succes',
        results: tours.length,
        data: { tours }
    });
})

app.post('/api/v1/tours', (req, res) => {
    console.log(req.body);
    res.status(200).send('done');

})

const port = 3000;

app.listen(port, () => {
    console.log(`Running on port ${port}...`);
})