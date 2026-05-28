const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==============================
// CORS Configuration
// ==============================

app.use(cors({
  origin: 'https://smart-kirana-app.vercel.app',
  credentials: true,
}));

// ==============================
// Middlewares
// ==============================

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Parse URL encoded data
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Serve uploaded product images
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);

// ==============================
// Routes
// ==============================

app.use('/api', routes);

// ==============================
// Error Handling
// ==============================

app.use(notFound);
app.use(errorHandler);

module.exports = app;