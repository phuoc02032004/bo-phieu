const express = require('express');
const userRoutes = require('./userRoutes');
const electionRoutes = require('./electionRoutes')
const router = express.Router();

const initRoutes = (app) => {
  app.use(express.json()); 
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/elections', electionRoutes);
  
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    })
  })
};


module.exports = initRoutes;