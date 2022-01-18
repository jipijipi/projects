const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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



//routes


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


module.exports = app;