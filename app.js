const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const cors = require('cors');
const connectDB = require('./config/database'); 
const initRoutes = require('./routes/index'); 
const Blockchain = require('./utils/blockchain');

require('dotenv').config();

const app = express();

global.blockchainInstance = new Blockchain(path.join(__dirname, 'blockchain.json')); 

connectDB.connectDB().catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1); 
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

initRoutes(app);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.error(err.stack); 
  const status = err.status || 500;
  res.status(status).json({ error: err.message }); 
});

const port = process.env.PORT || 3003; 

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;