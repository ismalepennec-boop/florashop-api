const router = require('express').Router();
const { isAuthenticated } = require('../middlewares/auth');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');

router.use(isAuthenticated);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/clear', clearCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);

module.exports = router;
