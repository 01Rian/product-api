const { validateProductFields, validateUpdateFields } = require('./validation/productFieldValidation');
const { validateProductId } = require('./validation/idValidation');
const { searchParamsValidation } = require('./validation/searchParamsValidation');
const { sanitizeProductData } = require('./sanitization/productSanitization');
const { formatDates, formatDateResponse } = require('./formatting/dateFormatting');
const { methodNotAllowed, handleInvalidRoute } = require('./errorHandling/routeErrorHandling');
const requestLoggerMiddleware = require('./requestLoggerMiddleware');

module.exports = {
  validateProductFields,
  validateProductId,
  validateUpdateFields,
  searchParamsValidation,
  sanitizeProductData,
  formatDates,
  formatDateResponse,
  methodNotAllowed,
  handleInvalidRoute,
  requestLoggerMiddleware
};
