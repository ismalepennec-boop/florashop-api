const express = require('express');
const cors = require('cors');

const app = express();

app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
