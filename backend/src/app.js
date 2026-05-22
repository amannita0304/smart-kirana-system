const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('./config/cors');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Serve uploaded product images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(cors);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
