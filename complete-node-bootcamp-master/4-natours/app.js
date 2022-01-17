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

app.get('/api/v1/tours/:id', (req, res) => {

    console.log(req.params);

    const id = + req.params['id'];
    const tour = tours.find(el => el.id === id);

    if (tour === undefined) {
        return res.status(404).json({
            status: 'not found bruh',
        })
    }

    res.status(200).json({
        status: 'succes',
        data: { tour }
    });
})

app.post('/api/v1/tours', (req, res) => {
    console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/starter/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            }
        });

    })

})

app.patch('/api/v1/tours/:id', (req, res) => {

    if (!tours.find(el => el.id === + req.params['id'])) {
        return res.status(404).json({
            status: 'ID not found bruh',
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: 'updated here',
        }
    })
})

app.delete('/api/v1/tours/:id', (req, res) => {

    if (!tours.find(el => el.id === + req.params['id'])) {
        return res.status(404).json({
            status: 'ID not found bruh',
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: 'updated here',
        }
    })
})

const port = 3000;

app.listen(port, () => {
    console.log(`Running on port ${port}...`);
})