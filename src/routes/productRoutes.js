const router = require('express').Router();
const validate = require('../middlewares/validate');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const { createProductSchema } = require('../validators/productValidator');
const { getAll, getById, create, update, remove } = require('../controllers/productController');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', isAuthenticated, isAdmin, validate(createProductSchema), create);
router.put('/:id', isAuthenticated, isAdmin, update);
router.delete('/:id', isAuthenticated, isAdmin, remove);

module.exports = router;
