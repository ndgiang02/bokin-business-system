/**
 * Success response
 */
exports.success = (
  res,
  data = {},
  message = "Success",
  statusCode = 200
) => {

  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    data
  });

};


/**
 * Error response
 */
exports.error = (
  res,
  message = "Internal Server Error",
  statusCode = 500,
  error = null
) => {

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    error
  });

};