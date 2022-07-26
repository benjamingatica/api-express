/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { server } = require('../index');
const Note = require('../models/Note');
const User = require('../models/User');
const { initialNotes, api, getAllContentFromNotes } = require('./helpers');

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('pswd', 10);
  const user = new User({ username: 'perro', passwordHash });
  await user.save();

  await Note.deleteMany();

  // eslint-disable-next-line no-restricted-syntax
  for (const note of initialNotes) {
    const noteObject = new Note({
      ...note,
      user: user._id,
    });
    console.log('noteObject: ', noteObject);
    // eslint-disable-next-line no-await-in-loop
    await noteObject.save();
  }
});

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('there are two notes', async () => {
  const response = await api.get('/api/notes');
  expect(response.body).toHaveLength(initialNotes.length);
});

test('the first note is about FullStack', async () => {
  const { contents } = await getAllContentFromNotes();

  expect(contents).toContain('Aprendiendo FullStack JS');
});

describe('create a note', () => {
  test('a valid note can be added', async () => {
    const passwordHash = await bcrypt.hash('pswd', 10);
    const user = new User({ username: 'gato', passwordHash });
    await user.save();

    const newNote = {
      content: 'Proximamente async/await',
      important: true,
      userId: user._id,
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const { contents, response } = await getAllContentFromNotes();
    expect(response.body).toHaveLength(initialNotes.length + 1);
    expect(contents).toContain(newNote.content);
  });

  test('note without content is not added', async () => {
    const newNote = {
      important: true,
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400);

    const { response } = await getAllContentFromNotes();
    expect(response.body).toHaveLength(initialNotes.length);
  });
});

test('a note can be deleted', async () => {
  const { response: firstResponse } = await getAllContentFromNotes();
  const { body: notes } = firstResponse;
  const noteToDelete = notes[0];

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204);

  const { contents, response: secondResponse } = await getAllContentFromNotes();
  expect(secondResponse.body).toHaveLength(initialNotes.length - 1);
  expect(contents).not.toContain(noteToDelete.content);
});

test('a note that do not exist can not be deleted', async () => {
  await api
    .delete('/api/notes/1234')
    .expect(400);

  const { response } = await getAllContentFromNotes();
  expect(response.body).toHaveLength(initialNotes.length);
});

afterAll(() => {
  mongoose.connection.close();
  server.close();
});
