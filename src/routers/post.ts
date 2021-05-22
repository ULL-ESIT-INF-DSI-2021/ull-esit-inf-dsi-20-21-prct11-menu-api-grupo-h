import * as express from 'express';
import {Ingredient} from '../models/ingredientsModel';

export const postRouter = express.Router();

postRouter.post('/ingredients', async (req, res) => {
  const ingredient = new Ingredient(req.body);
  try {
    await ingredient.save();
    res.status(201).send(ingredient);
  } catch (error) {
    res.status(400).send(error);
  }
});
