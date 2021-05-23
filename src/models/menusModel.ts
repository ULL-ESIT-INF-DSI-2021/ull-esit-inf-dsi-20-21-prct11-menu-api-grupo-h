import {Document, Schema, model} from 'mongoose';
import {foodGroup} from './ingredientsModel';

/**
 * Structure that defines the form that the documents will take.
 */
export interface MenuInterface extends Document {
  name: string,
  carboHydrates: number,
  proteins: number,
  lipids: number,
  courses: [{
    id_: string,
  }],
  foodGroupList: foodGroup[],
  price: number
}

/**
 * Schema that contains the properties that the documents to be inserted in the collections must have.
 */
const MenuSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  carboHydrates: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('Carbohydrates must be a positive number');
      }
    },
  },
  proteins: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('Proteins must be a positive number');
      }
    },
  },
  lipids: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('Lipids must be a positive number');
      }
    },
  },
  courses: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    required: true,
  },
  foodGroupList: {
    type: [String],
    required: true,
    validate: (list: string[]) => {
      if (list.length == 0) {
        throw new Error('The food group list must have at least one item');
      }
    },
  },
  price: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('The price must be a positive number');
      }
    },
  },
});

/**
 * Menu Model.
 */
export const Menu = model<MenuInterface>('Menu', MenuSchema);
