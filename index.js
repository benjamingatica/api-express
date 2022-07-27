/* eslint-disable no-underscore-dangle */
require('dotenv').config();
require('./mongo');
const express = require('express');
const cors = require('cors');
const logger = require('./loggerMiddleware');
const notFound = require('./middleware/notFound');
const handleErrors = require('./middleware/handleErrors');
const usersRouter = require('./controllers/users');
const notesRouter = require('./controllers/notes');
const loginRouter = require('./controllers/login');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));

app.use(logger);

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { "Content-Type": "application/json" });
//   response.end(JSON.stringify(notes))
// });

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>').end();
});

app.use('/api/notes', notesRouter);

app.use('/api/users', usersRouter);

app.use('/api/login', loginRouter);

app.use(notFound);

app.use(handleErrors);

const { PORT } = process.env;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
