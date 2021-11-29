const Router = require('express');
const router = new Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/check', reviewController.userCheckReview);
router.post('/', authMiddleware, reviewController.send);
router.put('/', authMiddleware, reviewController.change);
router.delete('/', authMiddleware, reviewController.delete);

module.exports = router;