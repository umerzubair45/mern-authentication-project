const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  const message = err.isOperational ? err.message : "Something went wrong.";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
  });
};

module.exports = errorHandler;
