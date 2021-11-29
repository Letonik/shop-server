const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/registration-admin', checkRole("ADMIN"), userController.registrationAdmin);
router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.put('/change/info', userController.changeInfo);
router.put('/change/password', userController.changePassword);
router.get('/auth', authMiddleware, userController.check);
router.get('/info', authMiddleware, userController.showInfo);

module.exports = router;