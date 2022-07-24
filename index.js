require('dotenv').config();
require('./mongo');
const express = require('express');
const cors = require('cors');
const logger = require('./loggerMiddleware');
const Note = require('./models/Note');
const notFound = require('./middleware/notFound');
const handleErrors = require('./middleware/handleErrors');

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

app.get('/api/notes', (request, response) => {
  Note.find({})
    .then((result) => {
      response.json(result);
    });
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

app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params;

  Note.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/notes', (request, response) => {
  const note = request.body;

  if (!note) {
    response.status(400).json({
      error: 'note is missing',
    });
    return;
  }

  if (note.content === undefined || note.content === null || note.content === '') {
    response.status(400).json({
      error: 'content is required',
    });
    return;
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important || false,
  });

  newNote.save()
    .then((savedNote) => {
      response.json(savedNote);
    });
});

app.use(notFound);

app.use(handleErrors);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
