import winston from 'winston';
import R from 'ramda';

/**
 * Middleware that checks for required parameters.
 *
 * @param { string[] } containerPath - Where the parameters live in the ctx
 * instance (session,[request, body], etc.).
 *
 * @param { string[] } params - the names of the params to check.
 *
 * @param { function } validator (optional) - a function to validate the
 * parameters in question. If this is omitted, a simple presence check will
 * be performed.
 */

export const validateParams = (containerPath, params, validator) => async (ctx, next) => {
  const container = R.path(containerPath, ctx);

  if (!container) {
    winston.warn('Invalid param container:', container);
    ctx.throw(400, 'Bad request');
  }

  R.forEach(assertValid(ctx, container, validator), params);
  await next();
};

export const validateBulkParams = (containerPath, params) => async (ctx, next) => {
  const container = R.path(containerPath, ctx);

  if (!container) {
    winston.warn('Invalid param container:', container);
    ctx.throw(400, 'Bad request');
  }
  container.forEach((item) => {
    R.forEach(assertValid(ctx, item), params);
  });

  await next();
};

const assertValid = (ctx, container, validator) => param => {
  if (!container[param]) {
    ctx.throw(400, `${param} is required.`);
  }

  if (validator && !validator(container[param])) {
    ctx.throw(400, `${param} is invalid.`);
  }
};
