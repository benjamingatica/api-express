const supertest = require('supertest');
const { app } = require('../index');
const User = require('../models/User');

const api = supertest(app);

const initialNotes = [
  {
    content: 'Aprendiendo FullStack JS',
    important: true,
    date: new Date(),
  },
  {
    content: 'Sígueme en mis RRSS',
    important: true,
    date: new Date(),
  },
];

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/notes');
  return {
    contents: response.body.map((note) => note.content),
    response,
  };
};

const getUsers = async () => {
  const usersDB = await User.find({});
  return usersDB.map((user) => user.toJSON());
};

module.exports = {
  initialNotes,
  api,
  getAllContentFromNotes,
  getUsers,
};
