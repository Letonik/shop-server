const Router = require('express');
const router = new Router();
const sectorController = require('../controllers/sectorController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/', checkRole("ADMIN"), sectorController.add);
router.put('/', checkRole("ADMIN"), sectorController.change);
router.get('/', sectorController.show);


module.exports = router;