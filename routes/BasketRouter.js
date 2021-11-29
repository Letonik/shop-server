const Router = require('express');
const router = new Router();
const basketController = require('../controllers/basketController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, basketController.add);
router.put('/', authMiddleware, basketController.change);
router.delete('/',authMiddleware,  basketController.delete);
router.get('/', authMiddleware, basketController.show);

module.exports = router;