import * as express from 'express';
import {Ingredient} from '../models/ingredientsModel';
import '../db/mongoose';

export const getRouter = express.Router();

getRouter.get('/ingredients', async (req, res) => {
  const filter = req.query.name?{name: req.query.name.toString()}:{};

  try {
    const ingredients = await Ingredient.find(filter);

    if (ingredients.length !== 0) {
      return res.send(ingredients);
    }

    return res.status(404).send({
      error: 'The ingredient is not in the database',
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

getRouter.get('/ingredients/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).send({
        error: 'The ingredient is not in the database',
      });
    }

    return res.send(ingredient);
  } catch (error) {
    return res.status(500).send(error);
  }
});
