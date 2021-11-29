const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Review, UserInfo, OrderProduct} = require('../models/models');

class ReviewController {
    async delete(req, res, next) {
        try {
            const {id} = req.body;
            await Review.destroy({where: {id}});
            return res.json('Комментарий успешно удален');
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async send(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const {productId, text} = req.body;
            const user = await UserInfo.findOne({where: {userId: decoded.id}});
            const bought = await OrderProduct.findOne({where: {userId: decoded.id, productId}});
            if (!bought) {
                return res.json("К сожалению мы не нашли данный товар среди ваших покупок");
            }
            const check = await Review.findOne({where: {userId: decoded.id, productId}});
            if (check) {
                return res.json("Вы не можете оставлять больше одного отзыва");
            }
            await Review.create({text, userId: decoded.id, productId, name: user.name});
            return res.json("Отзыв успешно отправлен!");
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async userCheckReview(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const {productId} = req.body;
            const bought = await OrderProduct.findOne({where: {userId: decoded.id, productId}});
            if (!bought) {
                return res.json("К сожалению мы не нашли данный товар среди ваших покупок");
            }
            const check = await Review.findOne({where: {userId: decoded.id, productId}});
            if (check) {
                return res.json("Благодарим вас, за ваш отзыв!");
            }
            return res.json("");
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async change(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const {productId, text} = req.body;
            const updateValue = await Review.update(
                {text},
                {where: {userId: decoded.id, productId}});
            return res.json("Отзыв успешно обновлен")
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }


}

module.exports = new ReviewController();