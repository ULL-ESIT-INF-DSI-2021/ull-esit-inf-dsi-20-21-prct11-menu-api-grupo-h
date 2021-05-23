import {CourseInterface, courseCategory} from '../models/coursesModel';
import {foodGroup} from '../models/ingredientsModel';

/**
 * Allows the menu to be valid, that is, to include one course from each category or at least three of them
 */
export function validate(menu: CourseInterface[]): boolean {
  if (menu.length < 3) {
    return false;
  }
  let group: courseCategory[] = [];
  menu.forEach((element) => {
    group.push(element.type);
  });
  group = group.filter((elem, index, self) => {
    return index === self.indexOf(elem);
  });
  if (group.length < 3) {
    return false;
  }
  return true;
}

/**
 * Allows you to calculate the nutritional information of the menu
 */
export function nutritionalComposition(courses: CourseInterface[]): number[] {
  const result: number[] = [0, 0, 0];

  courses.forEach((element) => {
    result[0] += element.carboHydrates;
    result[1] += element.proteins;
    result[2] += element.lipids;
  });

  return result;
}

/**
 * Allows you to list the ingredients groups by course
 */
export function getFoodList(courses: CourseInterface[]): foodGroup[] {
  const result: foodGroup[] = [];

  courses.forEach(function(element) {
    result.push(element.groupFood);
  });

  return result;
}

/**
 * Allows you to calculate the price of the menu
 */
export function calculatePrice(courses: CourseInterface[]): number {
  let result: number = 0;
  courses.forEach(function(element) {
    result += element.price;
  });
  return result;
}
