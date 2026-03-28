const express = require('express');
const cors = require('cors');

const app = express();

app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(require('./middlewares/errorHandler'));

module.exports = app;
