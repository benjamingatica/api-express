const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    date: 1,
    // _id: 0
  });
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  try {
    const { body } = request;
    const { username, name, password } = body;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
  } catch (err) {
    response.status(400).json(err);
  }
});

module.exports = usersRouter;
