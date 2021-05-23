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
