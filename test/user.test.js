const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const { api, getUsers } = require('./helpers');
const { server } = require('../index');

describe('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('pswd', 10);
    const user = new User({ username: 'perro', passwordHash });

    await user.save();
  });

  test('works as expected creating a fresh username', async () => {
    const usersAtStart = await getUsers();

    const newUser = {
      username: 'benjamins',
      name: 'ben',
      password: '1234',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const userAtEnd = await getUsers();

    expect(userAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = userAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username us already taken', async () => {
    const userAtStart = await getUsers();

    const newUser = {
      username: 'perro',
      name: 'ben',
      password: '1234',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.errors.username.message).toContain('`username` to be unique');

    const usersAtEnd = await getUsers();
    expect(usersAtEnd).toHaveLength(userAtStart.length);
  });

  afterAll(() => {
    mongoose.connection.close();
    server.close();
  });
});
