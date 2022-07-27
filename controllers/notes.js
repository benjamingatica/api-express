/* eslint-disable no-underscore-dangle */
const notesRouter = require('express').Router();
const userExtractor = require('../middleware/userExtractor');
const Note = require('../models/Note');
const User = require('../models/User');

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(notes);
});

notesRouter.get('/:id', (request, response, next) => {
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

notesRouter.put('/:id', (request, response, next) => {
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

notesRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params;

  try {
    await Note.findByIdAndDelete(id);
    response.status(204).end();
  } catch (err) {
    next(err);
  }
});

notesRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    console.log('bbhbhjbjhbbjbjh');
    const { content, important = false, userId } = request.body;

    const user = await User.findById(userId);
    console.log('user:', user);

    if (!content) {
      return response.status(400).json({
        error: 'note is missing',
      });
    }

    const newNote = new Note({
      content,
      date: new Date(),
      important,
      user: user._id,
    });

    const savedNote = await newNote.save();

    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    response.json(savedNote);
  } catch (err) {
    next(err);
  }
});

module.exports = notesRouter;
