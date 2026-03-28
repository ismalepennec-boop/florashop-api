const router = require('express').Router();
const validate = require('../middlewares/validate');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const { createCategorySchema } = require('../validators/productValidator');
const { getAll, create, update, remove } = require('../controllers/categoryController');

router.get('/', getAll);
router.post('/', isAuthenticated, isAdmin, validate(createCategorySchema), create);
router.put('/:id', isAuthenticated, isAdmin, update);
router.delete('/:id', isAuthenticated, isAdmin, remove);

module.exports = router;
