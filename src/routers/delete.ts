import * as express from 'express';
import {Ingredient} from '../models/ingredientsModel';
import {Course} from '../models/coursesModel';
import {Menu} from '../models/menusModel';
import '../db/mongoose';

/**
 * Router object is created that will allow us to define routes.
 */
export const deleteRouter = express.Router();

/**
 * An ingredient is removed from the database using the received name.
 */
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

/**
 * An ingredient is removed from the database using the received ID.
 */
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

/**
 * A course is removed from the database using the received name.
 */
deleteRouter.delete('/courses', async (req, res) => {
  if (!req.query.name) {
    return res.status(400).send({
      error: 'A name must be provided',
    });
  }

  try {
    const course = await Course.findOneAndDelete({name: req.query.name.toString()});
    if (!course) {
      return res.status(404).send({
        error: 'The course has not been found',
      });
    }
    return res.send(course);
  } catch (error) {
    return res.status(400).send(error);
  }
});

/**
 * A course is removed from the database using the received ID.
 */
deleteRouter.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).send({
        error: 'The course has not been found',
      });
    }
    return res.send(course);
  } catch (error) {
    return res.status(400).send(error);
  }
});

/**
 * A menu is removed from the database using the received name.
 */
deleteRouter.delete('/menus', async (req, res) => {
  if (!req.query.name) {
    return res.status(400).send({
      error: 'A name must be provided',
    });
  }
  try {
    const menu = await Menu.findOneAndDelete({name: req.query.name.toString()});
    if (!menu) {
      return res.status(404).send({
        error: 'The menu has not been found',
      });
    }
    return res.send(menu);
  } catch (error) {
    return res.status(400).send(error);
  }
});

/**
 * A menu is removed from the database using the received ID.
 */
deleteRouter.delete('/menus/:id', async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).send({
        error: 'The menu has not been found',
      });
    }
    return res.send(menu);
  } catch (error) {
    return res.status(400).send(error);
  }
});
