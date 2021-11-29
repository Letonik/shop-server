const Router = require('express');
const router = new Router();
const categoryController = require('../controllers/categoryController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/', checkRole("ADMIN"), categoryController.add);
router.delete('/', checkRole("ADMIN"), categoryController.delete);
router.get('/:sectorId', categoryController.show);
router.put('/', checkRole("ADMIN"), categoryController.change)


module.exports = router;