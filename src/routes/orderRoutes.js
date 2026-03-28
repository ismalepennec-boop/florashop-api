const router = require('express').Router();
const { isAuthenticated } = require('../middlewares/auth');
const { checkout, getMyOrders, getOrderById } = require('../controllers/orderController');

router.post('/checkout', isAuthenticated, checkout);
router.get('/', isAuthenticated, getMyOrders);
router.get('/:id', isAuthenticated, getOrderById);

module.exports = router;
