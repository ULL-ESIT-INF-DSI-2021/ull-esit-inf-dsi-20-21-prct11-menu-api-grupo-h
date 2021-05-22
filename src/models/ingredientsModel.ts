import {Document, Schema, model} from 'mongoose';

export type foodGroup = 'Proteins' | 'Vegetables' | 'Dairy' | 'Cereals' | 'Fruits';

export interface IngredientInterface extends Document {
  name: string,
  location: string,
  carboHydrates: number,
  proteins: number,
  lipids: number,
  price: number,
  type: foodGroup,
}

export const IngredientSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  location: {
    type: String,
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
  price: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('The price must be a positive number');
      }
    },
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: ['Proteins', 'Vegetables', 'Dairy', 'Cereals', 'Fruits'],
  },
});

export const Ingredient = model<IngredientInterface>('Ingredient', IngredientSchema);
