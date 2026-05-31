/**
 * Centralized Error Handling Middleware
 * Handles all errors consistently across the application
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Not Found Handler - 404
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body
    })
  }

  // Handle Supabase errors
  if (err.code) {
    console.error('Supabase error code:', err.code)
    
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this value already exists'
        })
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'The referenced record does not exist'
        })
      case 'PGRST116': // Single row not found
        return res.status(404).json({
          error: 'Not found',
          message: 'The requested resource was not found'
        })
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Please log in again'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please log in again'
    })
  }

  // Default error response
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Validation Error Handler
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message)
  const errorMessage = errors.join(', ')
  return new AppError(errorMessage, 400)
}

/**
 * Cast Error Handler (Invalid MongoDB/DB IDs)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

/**
 * JWT Error Handler
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401)
}

/**
 * JWT Expire Error Handler
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401)
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
  handleValidationError,
  handleCastError,
  handleJWTError,
  handleJWTExpiredError
}


