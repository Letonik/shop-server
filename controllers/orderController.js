const {Op} = require("sequelize");
const sequelize = require("sequelize");
const ApiError = require('../error/ApiError');
const jwt = require('jsonwebtoken');
const {Product} = require("../models/models");
const {Size} = require("../models/models");
const {BasketProduct} = require("../models/models");
const {Order, OrderProduct} = require('../models/models');
const mailService = require('../service/mail-service');
const {Review} = require("../models/models");

class OrderController {
    async showActive(req, res) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const products = await Order.findAll({where: {userId: decoded.id, active: true},
            include: [
                {model: OrderProduct, as: 'products'}
            ]});
        return res.json(products);
    }
    async showHistory(req, res) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const products = await Order.findAll({where: {userId: decoded.id, active: false},
            include: [
                {model: OrderProduct, as: 'products'}
            ]});
        let reviews = await Review.findAll({where: {userId: decoded.id}});
        return res.json({products, reviews});
    }
    async showActiveAdmin(req, res) {
        const products = await Order.findAll({where: {active: true},
            include: [
                {model: OrderProduct, as: 'products'}
            ]});
        return res.json(products);
    }
    async showHistoryAdmin(req, res) {
        let {limit = 9, page = 1} = req.query;
        let offset = page * limit - limit;
        const products = await Order.findAndCountAll({where: {active: false},
            order: [["createdAt", "DESC"]],
            limit: +limit, offset,
            include: [
                {model: OrderProduct, as: 'products'}
            ],
            distinct: true
        });
        return res.json(products);
    }
    async showStatistic(req, res) {
        let {sectorId, date} = req.query;
        if (date) {
            const sum = await OrderProduct.sum('price', {
                where: {
                    sectorId,
                    createdAt: {
                        [Op.startsWith]: date
                    }
                }});
            if (!sum) {
                return res.json(0);
            }
            return res.json(sum);
        }
        const sum = await OrderProduct.sum('price', {where: {sectorId}});
        return res.json(sum);
    }
    async showTable(req, res, next) {
        try {
            let {sectorId} = req.query;
            const products = await OrderProduct.findAll({
                where: {sectorId},
                attributes: ['name', [sequelize.fn('sum', sequelize.col('amount')), 'total']],
                raw: true,
                group: [['name']],
            });
            return res.json(products);
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const {productId, orderId} = req.body;
            await OrderProduct.destroy({where: {productId, orderId}});
            const check = await OrderProduct.findOne({where: {orderId}});
            if(!check) {
                await Order.destroy({where: {id: orderId}});
            }
            const products = await Order.findAll({where: {active: true},
                include: [
                    {model: OrderProduct, as: 'products'}
                ]});
            return res.json(products);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async deleteOrder(req, res, next) {
        try {
            const {orderId} = req.body;
            await OrderProduct.destroy({where: {orderId}});
            await Order.destroy({where: {id: orderId}});
            const products = await Order.findAll({where: {active: true},
                include: [
                    {model: OrderProduct, as: 'products'}
                ]});
            return res.json(products);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async add(req, res, next) {
      try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.SECRET_KEY);
          const {address, name, phone, products, sum, count} = req.body;
          const order = await Order.create({userId: decoded.id, address, name, phone, sum, count});
          const basket = await BasketProduct.destroy({where: {basketId: decoded.id}});
          JSON.parse(products).forEach(i =>
                OrderProduct.create({
                    amount: i.amount,
                    size: i.size,
                    name: i.name,
                    image: i.image,
                    price: i.price,
                    productId: i.productId,
                    sectorId: i.sectorId,
                    orderId: order.id,
                    userId: order.userId
                })
            )
          await mailService.sendNewOrder('aletalet447@gmail.com', name, phone, address);
          return res.json("Заказ оформлен! Мы свяжемся с вами в ближайшее время!");
      } catch (e) {
          next(ApiError.badRequest(e.message));
      }
    }
    async confirm(req, res, next) {
        try {
            const {id, products} = req.body;
            const updateValue = await Order.update(
                {active: false},
                {where: {id}});
            for (let product of JSON.parse(products)) {
                if (product.size) {
                    const amountSize = await Size.findOne({where: {productId: product.productId, name: product.size}});
                    const newAmount = Number(amountSize.amount) - Number(product.amount);
                    await Size.update(
                        {amount: newAmount},
                        {where: {productId: product.productId, name: product.size}});
                }
                const amountProduct = await Product.findOne({where: {id: product.productId}});
                const newAmount = Number(amountProduct.amount) - Number(product.amount);
                await Product.update(
                        {amount: newAmount},
                        {where: {id: product.productId}});
            }
            const orders = await Order.findAll({where: {active: true},
                include: [
                    {model: OrderProduct, as: 'products'}
                ]});
            return res.json(orders);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async changeAmount(req, res, next) {
        try {
            const {id, amount} = req.body;
            const updateValue = await OrderProduct.update(
                {amount: amount},
                {where: {id}});
            const products = await Order.findAll({where: {active: true},
                include: [
                    {model: OrderProduct, as: 'products'}
                ]});
            return res.json(products);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new OrderController();