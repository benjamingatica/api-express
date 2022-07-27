const ERROR_HANDLERS = {
  CastError: (res) => res.status(400).send({ error: 'is used is malformed' }),

  ValidationError: (res, { message }) => res.status(409).send({ error: message }),

  JsonWebTokenError: (res) => res.status(401).send({ error: 'token missing or invalid' }),

  TokenExpiredError: (res) => res.status(401).send({ error: 'Token has expired' }),

  defaultError: (res, { message }) => res.status(500).send(message).end(),
};

module.exports = (error, request, response, next) => {
  console.log('error.name', error.name);

  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError;

  handler(response, error);
};
