const { validationResult } = require('express-validator');

/** Returns 400 with the first validation message if express-validator found errors. */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const list = errors.array();
    return res.status(400).json({ message: list[0].msg, errors: list });
  }
  next();
}

module.exports = validate;
