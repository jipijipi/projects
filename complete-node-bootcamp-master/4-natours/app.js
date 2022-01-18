const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const { get } = require('http');

const app = express();


//middlewares

app.use(morgan('dev'));

app.use(express.json())

app.use((req, res, next) => {
    console.log('heyyyy');
    next();
})

app.use((req, res, next) => {
    const now = new Date();
    req.requestTime = now.toISOString();

    next();
})



//route handlers

const tours = JSON.parse(fs.readFileSync(`${__dirname}/starter/dev-data/data/tours-simple.json`));

const getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: `succes at ${req.requestTime}`,
        results: tours.length,
        data: { tours }
    });
};



const getTour = (req, res) => {

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
};

const addTour = (req, res) => {
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

};

const updateTour = (req, res) => {

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
};

const deleteTour = (req, res) => {

    if (!tours.find(el => el.id === + req.params['id'])) {
        return res.status(404).json({
            status: 'ID not found bruh',
        })
    }

    res.status(204).json({
        status: 'success',
        data: null,
    })
};


//routes

app.route('/api/v1/tours').get(getAllTours).post(addTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

//servers


const port = 3000;

app.listen(port, () => {
    console.log(`Running on port ${port}...`);
})