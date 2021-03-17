const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();
let DB_URL = process.env.DB_URL;

const HttpError = require('./models/http-error');
const usersRoutes = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }

    if (res.headerSent) {
        return next(error);
    }

    res
    .status(error.code || 500)
    .json({ message: error.message || 'An unknown error occurred!' });
    
});

mongoose
    .connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },)
    .then(() => app.listen(5000))
    .catch(err => console.log(err));

