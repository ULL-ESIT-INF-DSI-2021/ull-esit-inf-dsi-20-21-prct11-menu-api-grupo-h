import * as express from 'express';
import {Course, CourseInterface} from '../models/coursesModel';
import {Ingredient, IngredientInterface} from '../models/ingredientsModel';
import {calculateMacronutrients, predominantGroup, totalPrice} from '../utilities/courses';
import {nutritionalComposition, getFoodList, calculatePrice, validate} from '../utilities/menus';
import {Menu} from '../models/menusModel';
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

// Menus by name
postRouter.post('/menus', async (req, res) => {
  const menuObject = req.body;
  if (!menuObject.name || !menuObject.courses) {
    return res.status(400).send({
      error: 'One of the properties required to create a menu has not been defined',
    });
  }
  const arrayCourses: CourseInterface[] = [];
  for (let i: number = 0; i < menuObject.courses.length; i++) {
    const filter = {name: menuObject.courses[i]};
    const courseCorrect = await Course.findOne(filter);
    if (courseCorrect != null) {
      arrayCourses.push(courseCorrect);
    } else {
      return res.status(404).send({
        error: 'An course is not found in the database',
      });
    }
  }

  if (!validate(arrayCourses)) {
    return res.status(400).send({
      error: 'A menu must include one course from each category or at least three of them',
    });
  }

  const macronutrients = nutritionalComposition(arrayCourses);
  const correctMenu = {
    name: menuObject.name,
    carboHydrates: macronutrients[0],
    proteins: macronutrients[1],
    lipids: macronutrients[2],
    courses: arrayCourses,
    foodGroupList: getFoodList(arrayCourses),
    price: calculatePrice(arrayCourses),
  };

  try {
    const menu = new Menu(correctMenu);
    await menu.save();
    return res.status(201).send(menu);
  } catch (error) {
    return res.status(400).send(error);
  }
});
