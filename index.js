/* eslint-disable no-underscore-dangle */
require('dotenv').config();
require('./mongo');
const express = require('express');
const cors = require('cors');
const logger = require('./loggerMiddleware');
const Note = require('./models/Note');
const User = require('./models/User');
const notFound = require('./middleware/notFound');
const handleErrors = require('./middleware/handleErrors');
const usersRouter = require('./controllers/users');

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

app.get('/api/notes', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(notes);
});

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params;

  Note.findById(id)
    .then((note) => {
      if (!note) {
        response.status(404).end();
      }

      response.json(note);
    })
    .catch((err) => {
      next(err);
    });
});

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params;
  const note = request.body;

  const newNoteInfo = {
    content: note.content,
    important: note.important,
  };

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then((result) => {
      response.json(result);
    });
});

app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params;

  try {
    await Note.findByIdAndDelete(id);
    response.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post('/api/notes', async (request, response, next) => {
  const { content, important = false, userId } = request.body;

  const user = await User.findById(userId);

  if (!content) {
    response.status(400).json({
      error: 'note is missing',
    });
    return;
  }

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id,
  });

  // newNote.save()
  //   .then((savedNote) => {
  //     response.json(savedNote);
  //   })
  //   .catch((err) => next(err));

  try {
    const savedNote = await newNote.save();

    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    response.json(savedNote);
  } catch (err) {
    next(err);
  }
});

app.use('/api/users', usersRouter);

app.use(notFound);

app.use(handleErrors);

const { PORT } = process.env;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
