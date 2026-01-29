const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
require('./utils/loggerUtil');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.get('/', (req, res) => {
  res.send('Server is running');
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