import * as express from 'express';

/**
 * Router object is created that will allow us to define routes.
 */
export const defaultRouter = express.Router();

/**
 * Checks if the path specified in said request is not implemented.
 */
defaultRouter.all('*', (_, res) => {
  res.status(501).send();
});
