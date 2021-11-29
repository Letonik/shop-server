const Router = require('express');
const router = new Router();
const productController = require("../controllers/productController");
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/', checkRole("ADMIN"), productController.create);
router.put('/', checkRole("ADMIN"), productController.change);
router.delete('/', checkRole("ADMIN"), productController.delete);
router.get('/brands', productController.getAllBrands);
router.get('/size', productController.getSize);
router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.delete('/info', checkRole("ADMIN"), productController.deleteInfo);
router.post('/info', checkRole("ADMIN"), productController.createInfo);
router.delete('/size', checkRole("ADMIN"), productController.deleteSize);
router.post('/size', checkRole("ADMIN"), productController.createSize);
router.put('/size', checkRole("ADMIN"), productController.changeSize);
router.delete('/image', checkRole("ADMIN"), productController.deleteImage);
router.post('/image', checkRole("ADMIN"), productController.createImage);

module.exports = router;