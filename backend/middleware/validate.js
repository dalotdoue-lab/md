/**
 * Validation Middleware
 * Let Investments - Input validation using Joi
 * 
 * ============================================================================
 */

const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: '',
        },
      },
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace the request data with validated data
    req[property] = value;
    next();
  };
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const schemas = {
  // User schemas
  register: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required',
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character',
      }),
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('', null),
    company: Joi.string().max(255).allow('', null),
    country: Joi.string().max(100).allow('', null),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Investment schemas
  buy: Joi.object({
    companyId: Joi.string().uuid().required(),
    amount: Joi.number().positive().min(1).max(1000000).required(),
  }),

  sell: Joi.object({
    companyId: Joi.string().uuid().required(),
    shares: Joi.number().positive().integer().min(1).required(),
  }),

  // Wallet schemas
  deposit: Joi.object({
    amount: Joi.number().positive().min(10).max(100000).required(),
    provider: Joi.string().valid('bank', 'mpesa', 'stripe', 'paypal', 'demo').required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('', null),
    description: Joi.string().max(500).allow('', null),
  }),

  withdraw: Joi.object({
    amount: Joi.number().positive().min(10).max(100000).required(),
    provider: Joi.string().valid('bank', 'mpesa', 'paypal').required(),
    description: Joi.string().max(500).allow('', null),
  }),

  // Update profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    company: Joi.string().max(255),
    country: Joi.string().max(100),
    avatarUrl: Joi.string().uri(),
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required(),
  }),

  // Pagination
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
  }),

  // UUID param
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Search
  search: Joi.object({
    q: Joi.string().max(100).allow('', null),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),

  // Product order
  createOrder: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().uuid().required(),
          quantity: Joi.number().integer().positive().min(1).max(100).required(),
        })
      )
      .min(1)
      .max(20)
      .required(),
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
      phone: Joi.string().required(),
    }).required(),
  }),

  // Watchlist
  addWatchlist: Joi.object({
    companyId: Joi.string().uuid().required(),
    targetPrice: Joi.number().positive().allow(null),
    note: Joi.string().max(500).allow('', null),
  }),
};

module.exports = { validate, schemas };


