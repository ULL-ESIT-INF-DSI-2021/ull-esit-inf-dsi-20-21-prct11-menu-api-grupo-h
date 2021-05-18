import {Document, Schema, model} from 'mongoose';

interface IngredientInterface extends Document {
  name: string,
  location: string,
  carboHydrates: number,
  proteins: number,
  lipids: number,
  price: number,
  type: 'Proteins'|'Vegetables'|'Dairy'|'Cereals'|'Fruits',
}

const IngredientSchema = new Schema({
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
  },
  proteins: {
    type: Number,
    required: true,
  },
  lipids: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: ['Proteins', 'Vegetables', 'Dairy', 'Cereals', 'Fruits'],
  },
});

export const Ingredient = model<IngredientInterface>('Ingredient', IngredientSchema);
