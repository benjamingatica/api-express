const mongoose = require('mongoose');

// const connectionString = `mongodb+srv://benjamin:${pass}@cluster0.73igm.mongodb.net/api-express?retryWrites=true&w=majority`;
const connectionString = process.env.MONGO_DB_URI;

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.err(err);
  });
