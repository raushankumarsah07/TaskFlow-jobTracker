import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(422, 'Validation failed', messages));
  }
  next();
};
