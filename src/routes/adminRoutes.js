const router = require('express').Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const { getAllOrders, updateOrderStatus, getStats } = require('../controllers/adminController');

router.use(isAuthenticated, isAdmin);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/stats', getStats);

module.exports = router;
