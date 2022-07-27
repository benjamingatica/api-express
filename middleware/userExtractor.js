/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
  console.log('start extraction');
  const authorization = request.get('authorization');

  if (!(authorization && authorization.toLowerCase().startsWith('bearer'))) {
    return response.status(400).json({
      error: 'token is missing',
    });
  }
  const token = authorization.substring(7);

  let decodedToken = null;

  decodedToken = jwt.verify(token, process.env.SECRET);

  if (!token || !decodedToken.id) {
    return response.status(400).json({
      error: 'token id does not exist',
    });
  }

  const { id: userId } = decodedToken;

  request.body.userId = userId;

  console.log('llega aqui');
  next();
};
