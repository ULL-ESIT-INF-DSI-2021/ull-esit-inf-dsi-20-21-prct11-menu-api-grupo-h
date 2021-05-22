import {connect} from 'mongoose';

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
