
import * as express from 'express';
import {Course, CourseInterface} from '../models/coursesModel';
import {calculateMacronutrients, predominantGroup, totalPrice} from '../utilities/courses';
import {Ingredient, IngredientInterface} from '../models/ingredientsModel';
import {nutritionalComposition, getFoodList, calculatePrice, validate} from '../utilities/menus';
import {Menu} from '../models/menusModel';
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

// Courses by name
patchRouter.patch('/courses', async (req, res) => {
  if (!req.query.name) {
    return res.status(400).send({
      error: 'A name must be provided',
    });
  } else {
    const allowedUpdates = ['name', 'ingredients', 'quantity', 'type'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      const courseObject = req.body;
      if ((courseObject.ingredients && !courseObject.quantity) ||
      (!courseObject.ingredients && courseObject.quantity)) {
        return res.status(400).send({
          error: 'Parameters are missing. Ingredients and their quantities must be specified',
        });
      }
      if (courseObject.ingredients) {
        if (courseObject.ingredients.length != courseObject.quantity.length) {
          return res.status(400).send({
            error: 'The size of the ingredient and quantity array must be the same',
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
        const newData = {
          carboHydrates: macronutrients[0],
          proteins: macronutrients[1],
          lipids: macronutrients[2],
          groupFood: predominantGroup(arrayIngredients),
          price: totalPrice(arrayIngredients, courseObject.quantity),
          ingredients: arrayIngredients,
        };
        Object.assign(courseObject, newData);
      }

      try {
        const course = await Course.findOneAndUpdate({name: req.query.name.toString()}, courseObject, {
          new: true,
          runValidators: true,
        });

        if (course === null) {
          return res.status(404).send({
            error: 'The course has not been found',
          });
        } else {
          return res.send(course);
        }
      } catch (error) {
        return res.status(400).send(error);
      }
    }
  }
});

// Menus by name
patchRouter.patch('/menus', async (req, res) => {
  if (!req.query.name) {
    return res.status(400).send({
      error: 'A name must be provided',
    });
  } else {
    const allowedUpdates = ['name', 'courses'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      const menuObject = req.body;
      if (menuObject.courses) {
        const arrayCourses: CourseInterface[] = [];
        for (let i: number = 0; i < menuObject.courses.length; i++) {
          const filter = {name: menuObject.courses[i]};
          const courseCorrect = await Course.findOne(filter);
          if (courseCorrect != null) {
            arrayCourses.push(courseCorrect);
          } else {
            return res.status(404).send({
              error: 'A course is not found in the database',
            });
          }
        }

        if (!validate(arrayCourses)) {
          return res.status(400).send({
            error: 'A menu must include one course from each category or at least three of them',
          });
        }

        const macronutrients = nutritionalComposition(arrayCourses);
        const newData = {
          carboHydrates: macronutrients[0],
          proteins: macronutrients[1],
          lipids: macronutrients[2],
          courses: arrayCourses,
          foodGroupList: getFoodList(arrayCourses),
          price: calculatePrice(arrayCourses),
        };
        Object.assign(menuObject, newData);
      }

      try {
        const menu = await Menu.findOneAndUpdate({name: req.query.name.toString()}, menuObject, {
          new: true,
        });
        if (menu === null) {
          return res.status(404).send({
            error: 'The menu has not been found',
          });
        } else {
          return res.send(menu);
        }
      } catch (error) {
        return res.status(400).send(error);
      }
    }
  }
});
