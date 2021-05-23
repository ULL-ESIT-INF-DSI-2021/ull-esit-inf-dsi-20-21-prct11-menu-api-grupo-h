import {connect} from 'mongoose';

/**
 * By default localhost: 3000 will be chosen,
 * unless an online cluster has been configured through Heroku in the MONGODB_URL variable.
 */
const mongodbURL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/nutritional-information';

/**
 * MongoDB server connection.
 */
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
