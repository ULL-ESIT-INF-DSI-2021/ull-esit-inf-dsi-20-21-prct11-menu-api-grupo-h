import * as express from 'express';
import {Ingredient} from '../models/ingredientsModel';
import '../db/mongoose';

export const deleteRouter = express.Router();

// Ingredients by name
deleteRouter.delete('/ingredients', async (req, res) => {
  if (!req.query.name) {
    return res.status(400).send({
      error: 'A name must be provided',
    });
  }

  try {
    const ingredient = await Ingredient.findOneAndDelete({name: req.query.name.toString()});

    if (!ingredient) {
      return res.status(404).send({
        error: 'The ingredient has not been found',
      });
    }

    return res.send(ingredient);
  } catch (error) {
    return res.status(400).send();
  }
});

// Ingredients by ID
deleteRouter.delete('/ingredients/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
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
