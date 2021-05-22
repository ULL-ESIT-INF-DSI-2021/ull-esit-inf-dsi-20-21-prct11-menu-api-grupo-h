import * as express from 'express';
import {Ingredient, IngredientInterface} from '../models/ingredientsModel';
import {Course} from '../models/coursesModel';
import {calculateMacronutrients, predominantGroup, totalPrice} from '../utilities/courses';
import '../db/mongoose';

export const postRouter = express.Router();

// Ingredients by name
postRouter.post('/ingredients', async (req, res) => {
  const ingredient = new Ingredient(req.body);
  try {
    await ingredient.save();
    res.status(201).send(ingredient);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Courses by name
postRouter.post('/courses', async (req, res) => {
  const courseObject = req.body;
  if (!courseObject.name || !courseObject.ingredients || !courseObject.quantity || !courseObject.type ||
      courseObject.ingredients.length != courseObject.quantity.length) {
    return res.status(400).send({
      error: 'All courses\' properties must be included. Also the number of ingredients and quantity must be the same',
    });
  }

  const arrayIngredients: IngredientInterface[] = [];
  for (let i: number = 0; i < courseObject.ingredients.length; i++) {
    const filter = {name: courseObject.ingredients[i]};
    const correctIngredient = await Ingredient.findOne(filter);
    if (correctIngredient != null) {
      arrayIngredients.push(correctIngredient);
    } else {
      return res.status(404).send({
        error: 'An ingredient is not found in the database',
      });
    }
  }

  const macronutrients = calculateMacronutrients(arrayIngredients, courseObject.quantity);
  const correctCourse = {
    name: courseObject.name,
    carboHydrates: macronutrients[0],
    proteins: macronutrients[1],
    lipids: macronutrients[2],
    groupFood: predominantGroup(arrayIngredients),
    price: totalPrice(arrayIngredients, courseObject.quantity),
    ingredients: arrayIngredients,
    quantity: courseObject.quantity,
    type: courseObject.type,
  };

  try {
    const course = new Course(correctCourse);
    await course.save();
    return res.status(201).send(course);
  } catch (error) {
    return res.status(400).send(error);
  }
});
