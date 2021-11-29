const Router = require('express');
const router = new Router();
const carouselRouter = require('./carouselRouter');
const userRouter = require('./userRouter');
const productRouter = require('./productRouter');
const sectorRouter = require('./sectorRouter');
const categoryRouter = require('./categoryRouter');
const reviewRouter = require('./reviewRouter');
const basketRouter = require('./BasketRouter');
const orderRouter = require('./orderRouter');

router.use('/carousel', carouselRouter);
router.use('/user', userRouter);
router.use('/product', productRouter);
router.use('/sector', sectorRouter);
router.use('/categories', categoryRouter);
router.use('/review', reviewRouter);
router.use('/basket', basketRouter);
router.use('/order', orderRouter);


module.exports = router;