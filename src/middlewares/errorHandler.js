const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Données invalides', details: err.errors });
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Cette ressource existe déjà' });
  }

  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  res.status(status).json({ error: message });
};

module.exports = errorHandler;
