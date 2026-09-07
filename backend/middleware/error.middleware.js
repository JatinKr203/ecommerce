function notFound(req, res) {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.statusCode ? err.message : 'Internal server error'
  });
}

// Named exports at the end to match architectural pattern
module.exports = { 
  notFound, 
  errorHandler 
};
