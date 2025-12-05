const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error,
    timestamp: new Date().toISOString()
  });
};

const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    message: 'Validation Error',
    errors,
    timestamp: new Date().toISOString()
  });
};

const sendNotFound = (res, resource = 'Resource') => {
  res.status(404).json({
    success: false,
    message: `${resource} not found`,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound
};
