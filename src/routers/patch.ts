import * as express from 'express';
import {Ingredient} from '../models/ingredientsModel';
import '../db/mongoose';

export const patchRouter = express.Router();

// Ingredients by name
patchRouter.patch('/ingredients', async (req, res) => {
  if (!req.query.name) {
    return res.status(400).send({
      error: 'A name must be provided',
    });
  }
  const allowedUpdates = ['name', 'location', 'carboHydrates', 'proteins', 'lipids', 'price', 'type'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Update is not permitted',
    });
  }
  try {
    const ingredient = await Ingredient.findOneAndUpdate({name: req.query.name.toString()}, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ingredient) {
      return res.status(404).send({
        error: 'The ingredient has not been found',
      });
    }

    return res.send(ingredient);
  } catch (error) {
    return res.status(400).send(error);
  }
});
