# Informe Práctica 11 - API Node/Express de gestión de información nutricional

## Autores (grupo h):

* Dayana Armas Alonso (alu0101228020)
* Daniel Álvarez Medina (alu0101216126)
* Alberto Mendoza Rodríguez (alu0101217741)
* Sandro Jesús Socas Méndez (alu0101208770)
* Joel Aday Dorta Hernández (alu0100987584)

## 1. Introducción

En este informe se muestra y se explica la implementación de la **API**, haciendo uso de **Node/Express**, que permite realizar las operaciones de creación, lectura, modificación y borrado de ingredientes, platos y menús.

## 2. Objetivos

Esta práctica tiene como objetivos:

* Aprender sobre el uso de Node/Express
* Aprender el uso de MongoDB/MongoDB Atlas.
* Aprender el uso de Mongoose.
* Aprender a desplegar el API en Heroku.

## 3. Implementación de la API

En primer lugar, para poder realizar esta práctica se debe llevar a cabo el uso de las distintas peticiones `HTTP`: `GET`, `POST`, `PATCH` y `DELETE` de Node/Express que permita llevar las funcionalidades principales de ingredientes, platos y menús. También se hará uso de las bases de datos con **MongoDB**, la cual almacena los datos como documentos JSON y utilizaremos el **Moongose** para definir objetos a partir de esquemas donde podamos especificar las propiedades de dichos objetos. Además, podremos llevar a cabo la relación entre esquemas de las bases de datos para obtener una API más óptima que permita la actualización en las distintas bases de datos de aquellos elementos modificados. Finalmente, se llevará a cabo el código refactorizado correspondiente a la implementación de cada uno de los métodos HTTP que se quieren gestionar en la aplicación para conseguir una mayor modularidad.

Cabe destacar que todo nuestro código fuente se encuentra almacenado en src organizado en los directorios db, models, routers, utilities y el fichero index.ts. A continuación, vamos a explicar el código de cada uno de estos directorios.

### 3.1. Directorio db

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

### 3.2. Directorio Models

En cada fichero de este directorio, se definen tanto los esquemas donde se incluyen las propiedades de los documentos, como los modelos mongoose, para los ingredientes, platos y menús.

### 3.2.1. ingredientsModel.ts

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
* `trim` permite eliminar espacios no necesarios al principio y final de cada cadena de caracteres.

Por último, tenemos la opción `unique` que solo está habilitada en el nombre del alimento ya que de esta forma, evitamos que un ingrediente esté duplicado en nuestra base de datos.

Además, tenemos los correspondientes `validate` en las propiedades **carboHydrates**, **proteins**, **lipids** y **price**, para verificar que la cantidad introducida no sea negativa. Finalmente, destacamos la opción `enum` en la propiedad `type` para que su valor se encuentre dentro del conjunto `'Proteins', 'Vegetables', 'Dairy', 'Cereals', 'Fruits'`.

Finalmente, exportamos la **variable Ingredient** que contiene el modelo apuntado por Ingredient, el cual nos va a permitir instanciar ingredientes que podrán ser insertados en la base de datos nutritional-information.

### 3.2.2. coursesModel.ts

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

### 3.2.3. menusModel.ts

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

### 3.3. Directorio Routers

Con el fin de ganar modularidad, hemos creado este directorio el cual integrará los ficheros en los que se realizarán las diferentes peticiones **HTTP**(**GET**, **POST**, **PATCH** y **DELETE**) para los ingredientes, platos y menús. Además incluirá el fichero `default.ts` cuyo contenido se explicará a continuación.

### 3.3.1. Fichero default.ts

```ts
import * as express from 'express';

export const defaultRouter = express.Router();

defaultRouter.all('*', (_, res) => {
  res.status(501).send();
});
```

A través de la invocación a `express.Router()` obtendremos un objeto Router que nos permitirá definir rutas, en este caso definiremos uno por defecto. Teniendo en cuenta el uso de `all`, cualquiera que sea el método utilizado para llevar a cabo la petición, si la ruta especificada en dicha petición no se ha implementado, se enviará un estado 501 indicando que el servidor no admite la funcionalidad requerida para cumplir con la solicitud.

### 3.3.2. Operaciones HTTP sobre los ingredientes

### GET con el nombre del ingrediente

```ts
getRouter.get('/ingredients', async (req, res) => {
  const filter = req.query.name?{name: req.query.name.toString()}:{};

  try {
    const ingredients = await Ingredient.find(filter);

    if (ingredients.length !== 0) {
      return res.send(ingredients);
    }

    return res.status(404).send({
      error: 'The ingredient is not in the database',
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});
```

Lo primero que hacemos es comprobar si la petición `HTTP GET` realizada en la ruta `/ingredients` contiene una query string donde exista una clave denominada `name`. Si es así, nuestro filtro de búsqueda consistirá en un objeto cuya propiedad name tomará el valor asignado a la clave name de la query string. En caso de que el alimento introducido no exista en la base de datos se hará uso del estado 404 para indicar que el ingrediente que se quiere obtener no se puede encontrar. En caso de que ocurra un error inesperado al buscar el alimento se utilizará el estado 500 indicando que el servidor encontró una condición inesperada que le impidió cumplir con la solicitud. Sin embargo, si la búsqueda se realiza correctamente, entonces enviamos la información del ingrediente al cliente.

### GET con el id del ingrediente

```ts
getRouter.get('/ingredients/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).send({
        error: 'The ingredient is not in the database',
      });
    }

    return res.send(ingredient);
  } catch (error) {
    return res.status(500).send(error);
  }
});
```

En este caso la ruta es diferente con respecto al anterior punto de acceso. Ahora se incluye la cadena `/:id` que permite que la URL de petición tenga un formato similar a lo siguiente `/ingredients/609c27f37f43986188e26478`, por lo que se puede especificar el identificador único de un ingrediente después de `/ingredients/`. En el manejador, accedemos al identificador empleando `req.params.id`. Además, se utiliza el método `findById` que permite buscar documentos por su identificador único. Si al buscar el ingrediente se produce algún error se informa al cliente con el código de estado adecuado, en otro caso se envía la información sobre el ingrediente.

### POST

```ts
postRouter.post('/ingredients', async (req, res) => {
  const ingredient = new Ingredient(req.body);
  try {
    await ingredient.save();
    res.status(201).send(ingredient);
  } catch (error) {
    res.status(400).send(error);
  }
});
```

Para crear un alimento e insertarlo en nuestra base de datos, utilizaremos la petición `HTTP POST`.  Como hemos configurado el servidor para parsear el cuerpo de una petición como un objeto JSON, podemos instanciar un documento pasándole `req.body` directamente al modelo Ingredient. Si todo ha ido correctamente, utilizamos el estado 201 para indicar que la solicitud se ha cumplido y ha dado lugar a la creación de un recurso nuevo. En caso de de error, por ejemplo si no se ha especificado una propiedad del esquema del ingrediente, se utiliza el estado 400 para indicar que el servidor no puede procesar la solicitud debido a que la petición contiene algún error por parte del cliente.

### DELETE con el nombre del ingrediente

```ts
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
```

Lo primero que se hará es comprobar si la petición incluye una query string con una clave `name`, es decir, si se especifica en la petición el nombre del ingrediente que se desea borrar. En caso de que no se incluya, enviamos un estado 400 de vuelta al cliente. En caso de éxito, utilizamos el método `findOneAndDelete` del modelo `Ingredient` para buscar el ingrediente por el nombre y eliminarlo. Si el nombre del ingrediente no existe se mandará un estado 404 al cliente. En caso de que si se haya encontrado y borrado el ingrediente, se le  enviará como respuesta al cliente.

### DELETE con el id del ingrediente

```ts
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
```

En este caso, la únicas diferencias respecto a lo explicado anteriormente consiste en que ahora no tenemos que comprobar que nos pasan una query string con la petición, y además se emplea el método `findByIdAndDelete` en lugar del método `findOneAndDelete` para buscar y eliminar el ingrediente por el id.

### PATCH

```ts
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
```

Como hemos visto anteriormente, lo primero que se hará es comprobar si la petición incluye una query string con una clave name. En caso de que no se incluya, enviamos un estado 400 de vuelta al cliente. Pero si no ocurre ningún error, entonces se define un array `allowedUpdates` que incluye una lista de los campos que se podrán actualizar: 

- name
- location
- carbohydrates
- proteins
- lipids
- price
- type

El array `actualUpdates` contendrá los nombres de las propiedades del objeto apuntado por el cuerpo de la petición `req.body`, es decir, los nombres de los campos que se quieren actualizar, los cuales vienen especificados en el cuerpo de la petición. `isValidUpdate` hará uso del método `every` para comprobar que todos los campos que se desean actualizar están en la lista nombrada anteriormente. En caso de que no sea así enviará un estado de error 400 al cliente. Si todo ha ido bien se hace uso del método `findOneAndUpdate` del modelo `Ingredients` para poder buscar y actualizar un ingrediente de la base de datos, el método recibirá como parámetros: el nombre del alimento, el cuerpo de la petición y además un objeto donde se han establecido las opciones `new` y `runValidators`. La opción `new` permitirá que después de la operación de actualización se tenga acceso al documento con la modificación realizada en vez de la versión anterior. La opción `runValidators` comprobará las validaciones que existen en el esquema de ingredientes. Si el alimento a buscar no ha sido encontrado se mandará un estado 404 al cliente. En otro caso, se envía el ingrediente actualizado.

### 3.3.3. Operaciones HTTP sobre los platos

### Get con nombre del plato

```ts
getRouter.get('/courses', async (req, res) => {
  const filter = req.query.name?{name: req.query.name.toString()}:{};

  try {
    const course = await Course.findOne(filter).populate({
      path: "ingredients",
    });

    if (!course) {
      return res.status(404).send({
        error: 'The course is not in the database',
      });
    }

    return res.send(course);
  } catch (error) {
    return res.status(500).send(error);
  }
});
```

En primer lugar, comprobamos si la petición realizada en la ruta `/courses` contiene una query string en la que exista una clave denominada `name`. En caso afirmativo, nuestro filtro de búsqueda consistirá en un objeto cuya propiedad name tomará el valor asignado a la clave name de la query string. A continuación, utilizamos el método `findOne()` que nos permite realizar una búsqueda del plato. Como ya se ha comentado, en la colección `courses` guardamos los id de los ingredientes, por lo tanto si queremos mostrar la información completa de los ingredientes y no solo sus id, hay que emplear el método `populate()`, para hacer que la ruta `path: “ingredients”`, que hace referencia a la propiedad `ingredients` del plato, se sustituya por la información almacenada en la base de datos para los ingredientes con esos id. En caso de que no exista dicho plato en la base de datos, se hará uso del estado 404. Si ocurre un error inesperado, se mostrará el error de estado 500 que indica que el servidor encontró una condición inesperada que le impidió cumplir con la solicitud. Si no ocurre ningún error entonces se envía la información del plato al cliente.

### Get con id del plato

```ts
getRouter.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: "ingredients",
    });

    if (!course) {
      return res.status(404).send({
        error: 'The course is not in the database',
      });
    }

    return res.send(course);
  } catch (error) {
    return res.status(500).send(error);
  }
});
```

En este caso, tenemos el código de la petición HTPP GET en base al id, donde en vez de pasarle el nombre del plato, le pasamos el id correspondiente y hacemos uso del `req.params.id` y `findById()` explicados anteriormente.

### POST

```ts
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
```

Como hemos explicado anteriormente, el cuerpo de la petición ha sido parseado en un objeto JSON, por lo que principalmente comprobamos que se han pasado todas las propiedades correspondientes a dicho objeto y además, comprobamos que el tamaño del array de ingredientes sea igual al tamaño de array de cantidades de los respectivos ingredientes, si no se cumplen dichas condiciones se mostrará un mensaje de estado 400 con un cadena de error específica. Después, a través de un bucle for, se recorre el array de los ingredientes del plato, colocamos como filtro el nombre de cada uno de estos ingredientes y mediante la función `findOne()` buscamos si el ingrediente que se recorre se encuentra en la base de datos, si es así lo introducimos en un nuevo array `arrayIngredients` y en caso de encontrar un ingrediente que no esté, mostramos una salida de error de estado 404. Seguidamente, creamos una estructura que corresponde a la estructura que almacenaremos en la base de datos y rellenamos los campos correspondientes con los datos que se nos da en la solicitud y los datos de los cuales se necesita la realización de ciertos cálculos, como es el **precio total**, el **grupo predominante** y los **macronutrientes**. Finalmente, creamos un nuevo documento del modelo `Course` y le pasamos la estructura nueva que rellenamos, la cual guardamos en la base de datos con el `save()`.

### DELETE

### Delete con nombre del plato

```ts
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
```

En primer lugar, se comprueba si la petición incluye una query string con una clave name, es decir, si se especifica en la petición el nombre del plato que se desee borrar. En caso de que no se haya especificado, enviamos un estado 400 de vuelta al cliente. En caso de éxito, utilizamos el método `findOneAndDelete()` que nos permite buscar el plato por el nombre y una vez encontrado, eliminarlo. En caso de que el nombre del plato introducido no exista en la base de datos, se mandará un estado de error de 404 al cliente. Si se elimina el plato correctamente, se le enviará dicho plato como respuesta al cliente.

### Delete con id del plato

```ts
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
```

En este caso, las únicas diferencias respecto al anterior DELETE es que ahora se especifica el id del plato en vez del nombre y se hace uso de `req.params.id` y `findByIdAndDelete` explicados anteriormente.

### PATCH

```ts
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
```

Como ya hemos mencionado anteriormente, lo primero que se hace es comprobar si la petición incluye una query string con una clave name, es decir, nombre del plato en la petición. En caso de que no se incluya, enviamos un estado 400 de vuelta al cliente. Se define un array `allowedUpdates` que incluye una lista de los campos que se podrán actualizar: 

- name
- ingredients
- quantity
- type

El array `actualUpdates` contendrá aquellos nombres cuyos campos se quieren actualizar, los cuales vienen especificados en el cuerpo de la petición. isValidUpdate hará uso del método every para comprobar que todos los campos que se quieren actualizar están en el listado del array de campos permitidos a actualizar `allowedUpdates`. En caso contrario, enviará un estado de error 400 al cliente. A continuación, se realizan dos comprobaciones, donde el primer bloque de if comprueba que si en la petición se ha especificado los ingredientes pero no sus cantidades, o al inverso si no se ha especificado los ingredientes pero sí sus cantidades, este devolverá un error de estado 400 por falta de parámetros dado que si se desea añadir ingredientes o cantidades, estos deben modificarse a la vez. El siguiente bloque de if comprueba que el tamaño del array de ingrediente y el tamaño del array de cantidades sean iguales debido a que para cada ingrediente existirá una cantidad determinada. En caso de que no se cumpla, se devuelve un estado de error 400.

Posteriormente, se recorre el array de los ingredientes del plato, y mediante la función `findOne()` se busca si el ingrediente que recorre el for se encuentra en la base de datos, si es así se introduce en un nuevo array `arrayIngredients` y en caso de encontrar un ingrediente que no esté, muestra una salida de error. 

Seguidamente, se crea el objeto `newData` y asignamos valores a sus propiedades empleando las funciones `calculateMacronutrients`, `predominantGroup` y `totalPrice`. Con ayuda del `assign()`, fusionamos en `courseObject` las propiedades que se desean modificar en la petición y la estructura de datos anteriormente rellanada para finalmente tener una estructura del plato completa, la cual enviaremos al `findOneAndUpdate()` y este llevará a cabo la modificación correspondiente, si se produce algún error se envía al cliente el código de estado 404, si no se produce ningún error, se envía el plato actualizado al cliente.

### 3.3.4. Operaciones HTTP sobre los menús

### GET con nombre del menú

```ts
getRouter.get('/menus', async (req, res) => {
  const filter = req.query.name?{name: req.query.name.toString()}:{};

  try {
    const menu = await Menu.findOne(filter).populate({
      path: "courses",
      populate: {
        path: "ingredients",
      },
    });

    if (!menu) {
      return res.status(404).send({
        error: 'The menu is not in the database',
      });
    }

    return res.send(menu);
  } catch (error) {
    return res.status(500).send(error);
  }
});
```

Tal y como se ha hecho anteriormente se realiza la misma operación con menú, primero se comprueba si la petición `HTTP GET` realizada en la ruta `/menus` contiene una query string donde exista una clave denominada `name`. Si es así, nuestro filtro de búsqueda consistirá en un objeto cuya propiedad `name` tomará el valor asignado a la clave name de la query string. Ahora realizamos una búsqueda con el método `findOne()`, si el menú se encuentra, empleamos de nuevo el método `populate()` para que los id de los platos del menú se sustituyan por la información de la base de datos. A su vez, anidamos otro `populate()` para cambiar los id de los ingredientes por la información contenida en la colección `ingredients`. En caso de que el menú no exista se enviará al cliente el estado 404,  o si ocurre un error inesperado al realizar la petición el servidor enviará el estado 500. Sin embargo, si todo funciona correctamente se envía al cliente la información del menú.

### GET con id del menú

```ts
getRouter.get('/menus/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate({
      path: "courses",
      populate: {
        path: "ingredients",
      },
    });

    if (!menu) {
      return res.status(404).send({
        error: 'The menu is not in the database',
      });
    }

    return res.send(menu);
  } catch (error) {
    return res.status(500).send(error);
  }
});
```

En este caso, el código es similar al explicado anteriormente, con la diferencia que se emplea el id del menú accediendo a `req.params.id`. Además, se utiliza el método `findById` para buscar el menú.

### POST

```ts
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
```

En primer lugar, comprobamos que no faltan las propiedades `name` y `courses` en la petición `HTTP POST` realizada, si estas no se han indicado entonces se envía el código de estado 400 al cliente. A continuación, mediante un bucle `for` recorremos el array que contiene los nombres de los platos que hemos recibido en el cuerpo de la petición, y a través de la función `findOne()` comprobamos que estén en la base de datos, en caso afirmativo, lo insertamos en un nuevo array, mientras que en caso contrario, informamos de un error. Con esto conseguimos que en el cliente solamente sea necesario introducir el nombre de los platos y no toda la información sobre ellos, además como trabajamos con el contenido de la base de datos nos aseguramos que los ingredientes están actualizados y han sido validados correctamente por el esquema. Después, comprobamos que los platos introducidos en el array cumplen con los requisitos, es decir, incluye un plato de cada categoría o, al menos, tres de ellas, si no es así enviamos un error. Tras comprobar esto, creamos el objeto `correctMenu` que se va a almacenar en la base de datos. Una vez rellenado mediante las funciones necesarias como el cálculo del precio total, la lista de grupos de alimentos predominantes por plato y los valores que se nos indican en la petición, finalmente creamos un nuevo documento del modelo menú, para guardarlo en la colección correspondiente mediante `save()`.

### DELETE con el nombre del menú

```ts
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
```

En primer lugar, se comprueba si la petición incluye una query string con una clave `name`. En caso de que no se incluya, enviamos un estado 400 de vuelta al cliente. En caso de éxito, utilizamos el método `findOneAndDelete` del modelo Menu para poder buscar el menú por el nombre y eliminarlo. En caso de que el menú introducido no exista se mandará un estado 404 al cliente. Si se encuentra y elimina el menú, se le enviará como respuesta al cliente. 

### DELETE con el id del menú

```ts
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
```

El código para la petición `HTTP DELETE` empleando el id del menú es similar a lo explicado anteriormente con las diferencias que ya han sido mencionadas respecto al uso de `req.params.id` y `findByIdAndDelete`.

### PATCH

```ts
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
```

Primero se comprueba si la petición incluye una query string con una clave `name`. En caso de que no se incluya, enviamos un estado 400 de vuelta al cliente. Tras ello, se define un array `allowedUpdates` que incluye una lista de los campos que se podrán actualizar: 

* name
* courses

Con el array `actualUpdates` y el método `every` se comprueba que todos los campos que se desean actualizar están en la lista nombrada anteriormente. En caso de que no sea así, se enviará un estado de error 400 al cliente. En caso de éxito, se recorre el array `menuObject.courses` recibido en el cuerpo de la petición y que incluye los nombres de los platos que se van a incluir en el menú, a través de la función `findOne()` comprobamos que estén en la base de datos, en caso afirmativo, lo insertamos en el array `arrayCourses`, mientras que en caso contrario, informamos de un error. Ahora validamos este array para comprobar que incluye un plato de cada categoría o, al menos, tres de ellas, si esto no se cumple se enviará un estado de error 400. A continuación, se crea el objeto `newData` y asignamos valores a sus propiedades empleando las funciones `nutritionalComposition`, `getFoodList` y `calculatePrice`. Con ayuda del assign(), fusionamos las propiedades de los datos a modificador especificados en la petición y la estructura de datos anteriormente rellanada para finalmente tener una estructura del menú al completo, la cual enviaremos al `findOneAndUpdate()` y este llevará a cabo la modificación correspondiente, si se produce algún error se envía al cliente el código de estado adecuado, pero si todo funciona correctamente se envía el menú actualizado.

### 3.4. Directorio Utilities

En este directorio se incluyen los ficheros que almacenan las funciones que permiten realizar los cálculos solicitados en la práctica.

En el **fichero courses.ts** con la función `calculateMacronutrients()` se obtienen los datos acerca de la composición nutricional del plato, por su parte `predominantGroup()` indica cual es el grupo predominante en el plato, por último mediante `totalPrice()` se consigue el precio total.

En el **fichero menus.ts** la primera función que encontramos es `validate()` con la que se comprueba que el menu incluye un plato de cada categoría o, al menos, tres de ellas. `nutritionalComposition()` se emplea para calcular la composición nutricional, `getFoodList()` devuelve el listado de grupos de alimentos por orden de aparición, y con `calculatePrice()` se obtiene el precio total del menu.

### 3.5. Fichero index

En este fichero primero se importan todos los routers que hemos definido, y registramos cada uno de estos routers en la aplicación empleando el método app.use().

Con esta organización de directorios conseguimos que la aplicación sea mucho más legible y modular, además que el mantenimiento es más sencillo.

## 4. Despliegue y ejemplos de funcionamiento

Hasta este momento, se ha desplegado la API localmente, empleando el servidor de MongoDB local. Sin embargo, ahora vamos a desplegar la API en **Heroku** para lo que es necesario disponer de una base de datos desplegada en la nube. Esto lo hemos conseguido creando un clúster en **MongoDB Atlas**, y tras ello hemos llevado a cabo el despliegue en Heroku.

Ahora vamos a mostrar una serie de ejemplos con cada de las peticiones HTTP que hemos implementado:

### POST

* Petición HTTP POST correcta para un ingrediente:

![POST ingrediente](img/http_post_ingredient_correct.png)

En este caso, para poder insertar un nuevo ingrediente, podemos observar que hemos especificado las propiedades correspondientes al elemento a añadir. 

* Petición HTTP POST incorrecta para un ingrediente:

![POST ingrediente error](img/http_post_ingredient_error.png)


Si algunas de estas propiedades no se especifica, el programa mandará un error al cliente. Como en este ejemplo, sucede un error dado que no se ha indicado la propiedad `type` en la estructura.

* Petición HTTP POST correcta para un plato:

![POST plato](img/http_post_courses_correct.png)

Como se puede observar en la petición `HTTP POST` se indican las propiedades necesarias para coincidir con el esquema definido para los platos. Cabe destacar que solamente hemos tenido que indicar el nombre de los ingredientes y no toda la información de estos, lo que es posible gracias a que trabajamos con los id y obtenemos los ingredientes de la propia base de datos.

* Petición HTTP POST incorrecta para un plato:

![POST plato error](img/http_post_courses_error.png)

Si introducimos un ingrediente que no se encuentra en la base de datos, se informa del error al cliente.

* Petición HTTP POST para un menú:

![POST menu](img/http_post_menu.png)

En el caso del menú, se puede observar como sólo se indican las propiedades necesarias a añadir, como en el caso de los platos, dado que las otras propiedades se calculan a través de los valores dados o simplemente al trabajar con los id de los platos, ya no haría falta colocar toda la información del plato al estar relacionado dicho id con la base de datos del plato.


### GET

* Petición HTTP GET para un ingrediente:

![GET ingrediente](img/http_get_ingredient.png)

En este caso, se muestra toda la información para el ingrediente cuyo nombre se ha especificado en la petición.

En el caso de los id se obtendría el mismo resultado pero indicando en la petición lo siguiente: `/ingredients/valor del id`

* Petición HTTP GET para un plato:

![GET plato](img/http_get_course.png)

Como se puede observar, a pesar de que en los platos se almacenan los id de los ingredientes, al hacer el get se obtiene toda la información de estos, lo que es posible como ya se ha comentado gracias al método `populate()`.

En el caso de los id se obtendría el mismo resultado pero indicando en la petición lo siguiente: `/courses/valor del id`.

* Petición HTTP GET para un menú:

![GET menu](img/http_get_menu_peticion.png)

![GET menu](img/http_get_menu_resultado_1.png)

![GET menu](img/http_get_menu_resultado_2.png)

![GET menu](img/http_get_menu_resultado_3.png)

Ahora se muestra la información completa del menú y de todos los platos que lo forman.

En el caso de los id se obtendría el mismo resultado pero indicando en la petición lo siguiente:`/menus/valor del id`

### PATCH

En este caso, al realizar una petición HTTP PATCH, seguimos la misma estructura en todos los casos donde es necesario pasar por parámetro el nombre del ingrediente, plato o menú. Además, de permitir modificar aquellos campos que hemos visto en la estructura de los HTTP GET correspondientes.

* Petición HTTP PATCH para un ingrediente:

![PATCH ingrediente](img/http_patch_ingredient.png)

* Petición HTTP PATCH para un plato:

![PATCH plato](img/http_patch_course.png)

* Petición HTTP PATCH para un menú:

![PATCH menu](img/http_patch_menu.png)

### DELETE

A continuación, se realizan los HTTP DELETE correspondientes para cada uno de los casos dado que la implementación de código entre ellos es similar. Simplemente, podemos observar que se especifica la ruta necesaria dependiendo de si es un ingrediente, plato o menú y como parámetro, el nombre del elemento a eliminar.

* Petición HTTP DELETE para un menú:

![DELETE menu](img/http_delete_menu.png)

* Petición HTTP DELETE para un plato:

![DELETE plato](img/http_delete_course.png)

* Petición HTTP DELETE para un ingrediente:

![DELETE ingrediente](img/http_delete_ingredient.png)

La URL de conexión al clúster de **MongoDB Atlas** es la siguiente:

`mongodb+srv://grupo-h:ULL-DSI-grupo-h-21@cluster0.9yclc.mongodb.net/nutritional-information?retryWrites=true&w=majority`

## 5. Conclusión

En conclusión, esta práctica nos ha permitido trabajar con las distintas peticiones `HTTP`: `GET`, `POST`, `PATCH` y `DELETE`, adquiriendo los conocimientos necesarios sobre ellas para realizar la correcta implementación del código fuente. Además, hemos aprendido el manejo de bases de datos con **MongoDB**, la cual almacena los datos como documentos JSON. Por otro lado, con **Moongose** hemos comprendido la manera en la que se deben definir objetos a partir de esquemas donde podemos especificar propiedades para nuestros objetos. Además, nos hemos acercado aún más al mundo real llevando a cabo la relación entre distintos esquemas para tener una base de datos totalmente actualizada y de esta manera, cualquier elemento actualizado, se modificará en las demás bases de datos que tuviesen dicho elemento.

En cuanto a la carga de trabajo, podríamos decir que ha sido la práctica con mayor carga de trabajo realizada, además que el nivel de dificultad al principio fue bastante alto pero conforme íbamos realizando los métodos HTTP, algunas implementaciones eran similares y por lo tanto, menos costosas. Además, cabe destacar que la división del trabajo por partes con los compañeros del grupo ha facilitado su elaboración. 

Finalmente, podemos decir que estas prácticas grupales en relación a la práctica grupal 7 y esta, han sido quizá las prácticas más complejas de la asignatura y donde más conceptos hemos aprendido.

## 6. Bibliografía

* [Documentación sobre MongoDB](https://www.mongodb.com/es)
* [Documentación sobre Moongose](https://mongoosejs.com/)
* [Múltiples populate](https://dev.to/paras594/how-to-use-populate-in-mongoose-node-js-mo0)
* [Documentación sobre Heroku](https://www.heroku.com/)
* [Códigos de estado HTTP](https://httpstatuses.com/)
* [Apuntes de la asignatura](https://ull-esit-inf-dsi-2021.github.io/nodejs-theory/)
* [Guión de la práctica 11](https://ull-esit-inf-dsi-2021.github.io/prct11-menu-api/)
