const { sendError } = require('./response');

const tryCatch = (fn, statusCode = 400) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      sendError(res, err.message, statusCode || 500);
    } finally {
      if (req.db && req.db.client) {
        await req.db.client.close();
      }
    }
  };
};

module.exports = { tryCatch };
