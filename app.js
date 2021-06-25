const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const HttpError = require('./models/http-error');
const userRoutes = require('./routes/user-routes');
const subscriptionRoutes = require('./routes/subscription-routes');
const libraryRoutes = require('./routes/library-routes');

const app = express();

app.use(bodyParser.json());

app.use(
    '/uploads/profile-images',
    express.static(path.join('uploads', 'profile-images'))
);

app.use('/assets/', express.static('assets'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE'
    );
    next();
});

app.use('/api/users', userRoutes);
app.use('/api/plans', subscriptionRoutes);
app.use('/api/library', libraryRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {});
    }

    if (res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500).json({
        message: error.message || 'An unknown error occurred!',
    });
});

mongoose
    .connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => app.listen(process.env.PORT || 5000))
    .catch((err) => console.log(err));
