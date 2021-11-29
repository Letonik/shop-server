const Router = require('express');
const router = new Router();
const orderController = require('../controllers/orderController');
const checkRole = require('../middleware/checkRoleMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, orderController.add);
router.put('/amount', authMiddleware, orderController.changeAmount);
router.put('/', authMiddleware, orderController.confirm);
router.delete('/product', authMiddleware, orderController.deleteProduct);
router.delete('/', authMiddleware, orderController.deleteOrder);
router.get('/active', authMiddleware, orderController.showActive);
router.get('/history', authMiddleware, orderController.showHistory);
router.get('/active_admin', checkRole("ADMIN"), orderController.showActiveAdmin);
router.get('/history_admin', checkRole("ADMIN"), orderController.showHistoryAdmin);
router.get('/statistic', checkRole("ADMIN"), orderController.showStatistic);
router.get('/table', checkRole("ADMIN"), orderController.showTable);

module.exports = router;