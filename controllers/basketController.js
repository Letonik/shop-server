const ApiError = require('../error/ApiError');
const jwt = require('jsonwebtoken');
const {BasketProduct} = require('../models/models');

class BasketController {
    async show(req, res) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const products = await BasketProduct.findAll({
            where: {basketId: decoded.id}});
        return res.json(products);

    }
    async delete(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const {productId} = req.body;
            await BasketProduct.destroy({where: {productId, basketId: decoded.id}});
            const products = await BasketProduct.findAll({
                where: {basketId: decoded.id}});
            return res.json(products);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async add(req, res, next) {
      try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.SECRET_KEY);
          const {productId, sectorId, size, amount, name, image, maxCount, price} = req.body;
          const check = await BasketProduct.findOne({where: {basketId: decoded.id, productId}});
          if (check) {
              return res.json("Товар уже у вас в корзине");
          }
          const add = await BasketProduct.create(
              {basketId: decoded.id, productId, amount, name, image,
              maxCount, price, size, sectorId}
              );
          return res.json("Товар добавлен в корзину");
      } catch (e) {
          next(ApiError.badRequest(e.message));
      }
    }

    async change(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const {productId, amount} = req.body;
            const updateValue = await BasketProduct.update(
                {amount},
                {where: {basketId: decoded.id, productId}});
            const products = await BasketProduct.findAll({
                where: {basketId: decoded.id}});
            return res.json(products);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new BasketController();