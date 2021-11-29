const Router = require('express');
const router = new Router();
const carouselController = require('../controllers/carouselController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/', checkRole("ADMIN"), carouselController.add);
router.delete('/', checkRole("ADMIN"), carouselController.delete);
router.put('/', checkRole("ADMIN"), carouselController.change);
router.get('/', carouselController.show);


module.exports = router;