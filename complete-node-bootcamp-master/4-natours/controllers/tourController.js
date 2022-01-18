const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`));



exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: `succes at ${req.requestTime}`,
        results: tours.length,
        data: { tours }
    });
};

exports.getTour = (req, res) => {

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

exports.addTour = (req, res) => {
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

exports.updateTour = (req, res) => {

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

exports.deleteTour = (req, res) => {

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


