# Informe Práctica 11 - API Node/Express de gestión de información nutricional

## Autores (grupo h):

* Dayana Armas Alonso (alu0101228020)
* Daniel Álvarez Medina (alu0101216126)
* Alberto Mendoza Rodríguez (alu0101217741)
* Sandro Jesús Socas Méndez (alu0101208770)
* Joel Aday Dorta Hernández (alu0100987584)

## 1. Introducción

En este informe se muestra y explica la implementación de la **API**, haciendo uso de **Node/Express**, que permite realizar las operaciones de creación, lectura, modificación y borrado de ingredientes, platos y menús.

## 2.Objetivos

Esta práctica tiene como objetivos:

* Aprender sobre el uso de Node/Express
* Aprender el uso de MongoDB/MongoDB Atlas.
* Aprender el uso de Mongoose.
* Aprender a desplegar el API en Heroku.

### 3. Implementación de la API

En primer lugar, para poder realizar esta práctica se debe llevar a cabo el uso de las distintas peticiones `HTTP`: `GET`, `POST`, `PATCH` y `DELETE` de Node/Express que permita llevar las funcionalidades principales de ingredientes, platos y menús. También se hará uso de las bases de datos con **MongoDB**, la cual almacena los datos como documentos JSON y utilizaremos el **Moongose** para definir objetos a partir de esquemas donde podamos especificar las propiedades de dichos objetos. Además, podremos llevar a cabo la relación entre esquemas de las bases de datos para obtener una API más óptima que permita la actualización en las distintas bases de datos de aquellos elementos modificados. Finalmente, se llevará a cabo el código refactorizado correspondiente a la implementación de cada uno de los métodos HTTP que se quieren gestionar en la aplicación para conseguir una mayor modularidad.

Cabe destacar que todo nuestro código fuente se encuentra almacenado en src organizado en los directorios db, models, routers, utilities y el fichero index.ts. A continuación, vamos a explicar el código de cada uno de estos directorios.

#### 3.1. Directorio db

En este directorio almacenaremos el fichero mongoose.ts cuyo contenido se explicará a continuación.

```ts
const mongodbURL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/nutritional-information';

connect(mongodbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log('Connection to MongoDB server established');
}).catch(() => {
  console.log('Unnable to connect to MongoDB server');
});
```

En este fichero es donde almacenamos el código fuente que nos permite realizar la conexión al servidor de MongoDB. 

Para ello, en primer lugar usamos el **método connect de MongoClient**. Dicho método recibe, como primer argumento, la URL de conexión al servidor de MongoDB, la última parte de esta URL corresponde con el nombre de la base de datos, esta es, **nutritional-information**. Como segundo argumento tenemos un objeto con las opciones de conexión y como tercer argumento se indica un callback que hará que connect devuelva una promesa. Esto nos permite definir qué ocurrirá si la promesa se cumple, a través del manejador pasado a then donde mostramos por consola un mensaje de verificación de proceso, y lo que ocurrirá si la promesa se rompe, a través del manejador pasado a catch donde mostramos por consola un mensaje de error de proceso.

#### 3.2.Directorio Models

En cada fichero de este directorio, se definen tanto los esquemas donde se incluyen las propiedades de los documentos, como los modelos mongoose, para los ingredientes, platos y menús.

**ingredientsModel.ts**

En primer lugar se define el type **foodgroup** para establecer los diferentes grupos de alimentos al que puede pertenecer un ingrediente.

```ts
export type foodGroup = 'Proteins' | 'Vegetables' | 'Dairy' | 'Cereals' | 'Fruits';
```
Como se puede observar existen 4 grupos:
* Proteins: representa a carnes, pescados, huevos, tofu, frutos secos, semillas y legumbres.
* Vegetables: se trata de las verduras y hortalizas.
* Dairy: es la leche y sus derivados.
* Cereals.
* Fruits.

Luego creamos la **interfaz ingredientsInterface** que extiende de la clase **Document** de mongoose.

```ts
export interface IngredientInterface extends Document {
  name: string,
  location: string,
  carboHydrates: number,
  proteins: number,
  lipids: number,
  price: number,
  type: foodGroup,
}
```
Esta interfaz nos permite definir la forma que van a tomar los documentos de ingredientes. Las propiedades que se han incluido son las solicitadas en la práctica, de forma que se tiene el nombre, la localización de origen, la composición nutricional por 100 gr del ingrediente (carboHydrates, proteins y lipids), el precio por kg en euros y el grupo de alimentos al que pertenece.

A continuación definimos el esquema **IngredientSchema**:

```ts
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
```


Cabe destacar que cada una de estas propiedades del esquema, tiene las siguientes opciones:
 
* `type` define el tipo de cada propiedad.
* `required` permite especificar que una propiedad del esquema tenga que especificarse obligatoriamente.
* `trim` que permite eliminar espacios no necesarios al principio y final de cada cadena de caracteres.

Por último, tenemos la opción `unique` que solo está habilitada en el nombre del alimento ya que de esta forma, evitamos que un ingrediente esté duplicado en nuestra base de datos.

Además, tenemos los correspondientes `validate` en las propiedades **carboHydrates**, **proteins**, **lipids** y **price**, para verificar que la cantidad introducida no sea negativa. Finalmente, destacamos la opción `enum` en la propiedad `type` para que su valor se encuentre dentro del conjunto `'Proteins', 'Vegetables', 'Dairy', 'Cereals', 'Fruits'`.

Finalmente, exportamos la **variable Ingredient** que contiene el modelo apuntado por Ingredient, el cual nos va a permitir instanciar ingredientes que podrán ser insertados en la base de datos nutritional-information.

**coursesModel.ts**

En primer lugar se define el type **courseCategory** para diferenciar los platos por categorías. 

```ts
export type courseCategory = 'Starter' | 'First' | 'Second' | 'Dessert';
```

Como se puede observar se considera que un plato puede pertenecer a cuatro categorías distintas: entrante, primer plato, segundo plato y postre.

Luego creamos la interfaz **CourseInterface** para establecer la forma que deben tener los documentos de los platos. 

```ts
export interface CourseInterface extends Document {
  name: string,
  carboHydrates: number,
  proteins: number,
  lipids: number,
  groupFood: 'Proteins' | 'Vegetables' | 'Dairy' | 'Cereals' | 'Fruits',
  price: number,
  ingredients: [{
    id_: string,
  }],
  quantity: number[],
  type: courseCategory,
}
```

En este caso, en la propiedad **ingredients** almacenamos un array que contiene una propiedad **id** de tipo cadena. Esto nos servirá para relacionar los esquemas de ingredientes y platos, ya que en lugar de almacenar todo el contenido de los ingredientes, únicamente guardamos sus ids, por tanto si alguno de ellos cambia en la colección `ingredients`, ese cambio se verá reflejado en los platos.

A continuación definimos el esquema **CourseSchema** correspondiente para los platos:

```ts
export const CourseSchema = new Schema({
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
  groupFood: {
    type: String,
    required: true,
    trim: true,
    enum: ['Proteins', 'Vegetables', 'Dairy', 'Cereals', 'Fruits'],
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
  ingredients: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
    }],
    required: true,
  },
  quantity: {
    type: [Number],
    required: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: ['Starter', 'First', 'Second', 'Dessert'],
  },
});
```

Cabe destacar que ahora también se utilizan las opciones `type`, `trim` y `unique` que solo está habilitada en el nombre del plato ya que de esta forma, evitamos que un plato esté duplicado.

Al igual que en el esquema anterior, tenemos algunas opciones de `validate` que nos permiten verificar y asegurar que la cantidad introducida siempre sea positiva.

Además, al haber relacionado las bases de datos por id’s, en el esquema hacemos uso en la propiedad **ingredients** del type `Schema.Types.ObjectId` que nos permite relacionar los esquemas de ingredientes y de platos, con la opción `ref` indicamos qué modelo usar durante la población, es decir, durante la recogida de la información de la base de datos. Entonces al realizar una petición `HTTP GET` sustituimos los ids que se encuentran en **ingredients** por la información que se almacena en la base de datos para los ingredientes con esos id. De esta forma, si un ingrediente se modifica en la colección `ingredients`, se actualiza en `courses`, por lo que siempre trabajamos con los ingredientes actualizados.

Finalmente, definimos **Course** que apunta a un objeto `Model<CourseInterface>`, a partir del cual podremos instanciar documentos `CourseInterface`.

```ts
export const Course = model<CourseInterface>('Course', CourseSchema);
```

**menusModel.ts**

Como en los ficheros anteriores, primero creamos la interfaz **CourseInterface** donde se definen las propiedades que deben incluir los documentos de los menús. 

```ts
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
```

En este caso, en la propiedad **courses** almacenamos un array que contiene una propiedad **id** de tipo cadena. Esto nos servirá para relacionar los esquemas de platos y menús.

A continuación definimos el esquema **MenuSchema** correspondiente para los menús:

```ts
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
```

En este esquema también se emplean las opciones `type`, `trim` y `unique` que solo está habilitada en el nombre del menú ya que de esta forma, evitamos que un menú esté duplicado.

En este caso, también tenemos algunas opciones de `validate` que nos permiten verificar y asegurar que la cantidad introducida siempre sea positiva.

Además, el tipo de la propiedad `courses` es un array de `Schema.Types.ObjectId` con lo que se consigue establecer relaciones entre los esquema de platos y de menú, y se incluye la opción `ref` con valor `Course` lo que indica que cuando realicemos una petición `HTTP GET` se tiene que sustituir los id por la información que está almacenada en la base de datos para cada uno de esos platos.

Finalmente, definimos **Menu** que apunta a un objeto `Model<MenuInterface>`, a partir del cual podremos instanciar documentos `MenuInterface`.

```ts
export const Menu = model<MenuInterface>('Menu', MenuSchema);
```
