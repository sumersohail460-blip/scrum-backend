const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
require('./utils/loggerUtil');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes should come first
app.use('/api', routes);

// Serve loyalty-card.html for browser access (after API routes)
app.get('/loyalty-card', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/loyalty-card.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

module.exports = app;