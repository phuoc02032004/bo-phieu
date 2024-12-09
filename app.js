const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const cors = require('cors');
const connectDB = require('./config/database'); // Adjust path as needed
const initRoutes = require('./routes/index'); // Adjust path as needed
require('dotenv').config();

const app = express();

connectDB.connectDB().catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1); // Exit with an error code
});

// Middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routes
initRoutes(app);


// Error Handling
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


const port = process.env.PORT || 3003; // Use PORT from environment variables if available

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;