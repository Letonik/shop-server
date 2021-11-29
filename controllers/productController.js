const uuid = require('uuid');
const path = require('path');
const {Op} = require("sequelize");
const {Product, ProductInfo, Size, Image, Review} = require('../models/models');
const ApiError = require('../error/ApiError');
const fs = require('fs');

class ProductController {

    async create(req, res, next) {
        try {
            let {sectorId, categoryId, name, price, description, brand, amount, info, size, sale = price,} = req.body;
            const {image} = req.files;
            const product = await Product.create({
                sectorId, categoryId, name, price, sale, brand, description, amount
            })
            if (Array.isArray(image)) {
                for (let i of image) {
                    let fileName = uuid.v4() + '.jpg';
                    i.mv(path.resolve(__dirname, '..', 'static', fileName))
                    Image.create({
                        name: fileName,
                        productId: product.id
                    })
                }
            } else {
                let fileName = uuid.v4() + '.jpg';
                image.mv(path.resolve(__dirname, '..', 'static', fileName))
                Image.create({
                    name: fileName,
                    productId: product.id
                })
            }

            if (info) {
                info = JSON.parse(info);
                info.forEach(i =>
                    ProductInfo.create({
                        title: i.title,
                        information: i.information,
                        productId: product.id
                    })
                )
            }
            if (size) {
                size = JSON.parse(size);
                size.forEach(i =>
                    Size.create({
                        name: i.name,
                        amount: i.amount,
                        productId: product.id
                    })
                )
            }

            return res.json("Продукт успешно создан");
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res) {
        let {sort = "boughtCount", option = "DESC", min = 0, max = 100000000, limit = 9, page = 1, ...other} = req.query;
        let offset = page * limit - limit;
        let products = await Product.findAndCountAll({
            where: {
                ...other,
                sale: {
                    [Op.between]: [min, max]
                }
            },
            order: [[sort, option]],
            limit: +limit, offset,
            include: [
                {model: Image, as: 'images'}
            ],
            distinct: true
        });
        return res.json(products);
        //other = {sectorId, categoryId, ?brand?}
    }

    async getAllBrands(req, res) {
        let {categoryId} = req.query;
        let brands = await Product.findAll({where: {categoryId}, group: 'brand'});
        return res.json(brands);
    }

    async getOne(req, res) {
        const {id} = req.params;
        const device = await Product.findOne(
            {
                where: {id},
                include: [
                    {model: ProductInfo, as: 'info'},
                    {model: Size, as: 'size', order: [["name", "DESC"]]},
                    {model: Image, as: 'images'},
                    {model: Review, as: 'reviews'},
                ]
            }
        )
        return res.json(device);
    }

    async change(req, res, next) {
        try {
            const {id, name, price, sale, description, brand, info, size} = req.body;
            await Product.update(
                {name, price, sale, description, brand},
                {where: {id}});
            if (info) {
                await ProductInfo.destroy({where: {productId: id}});
                info.forEach(i =>
                    ProductInfo.create({
                        title: i.title,
                        information: i.information,
                        productId: id
                    })
                )
            }
            if (size) {
                await Size.destroy({where: {productId: id}});
                size.forEach(i =>
                    Size.create({
                        name: i.name,
                        amount: i.amount,
                        productId: id
                    })
                )
            }
            return res.json("Данные успешно обновлены");
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async delete(req, res, next) {
        try {
            const {id} = req.body;
            await Size.destroy({where: {productId: id}});
            await ProductInfo.destroy({where: {productId: id}});
            await Review.destroy({where: {productId: id}});
            const images = await Image.findAll({where: {productId: id}});
            for (let i of images) {
                fs.unlinkSync(path.resolve(__dirname, '..', 'static', i.name));
            }
            await Image.destroy({where: {productId: id}});
            await Product.destroy({where: {id}});
            return res.json('Продукт успешно удален');
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async createInfo(req, res, next) {
        try {
            const {title, information, productId} = req.body;
            const info = await ProductInfo.create({
                title, information, productId
            })
            return res.json(info);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async deleteInfo(req, res, next) {
        try {
            const {id} = req.body;
            await ProductInfo.destroy({where: {id}});
            return res.json('Свойство успешно удалено');
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getSize(req, res) {
        const {productId, name} = req.query;
        const size = await Size.findOne(
            {
                where: {productId, name}
            }
        )
        return res.json(size.amount);
    }

    async createSize(req, res, next) {
        try {
            const {name, amount, productId} = req.body;
            const size = await Size.create({
                name, amount, productId
            })
            const amountProduct = await Product.findOne({where: {id: productId}});
            const newAmount = Number(amountProduct.amount) + Number(amount);
            const product = await Product.update({amount: newAmount}, {where: {id: productId}})
            return res.json("Размер создан");
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async deleteSize(req, res, next) {
        try {
            const {productId, id} = req.body;
            const amountProduct = await Product.findOne({where: {id: productId}});
            const size = await Size.findOne({where: {id}});
            const newAmount = Number(amountProduct.amount) - Number(size.amount);
            const product = await Product.update({amount: newAmount}, {where: {id: productId}})
            const sizeDel = await Size.destroy({where: {id}});
            return res.json('Свойство успешно удалено');
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async changeSize(req, res, next) {
        try {
            const {id, name, amount, productId} = req.body;
            const amountProduct = await Product.findOne({where: {id: productId}});
            const size = await Size.findOne({where: {id}});
            const newAmount = Number(amountProduct.amount) - Number(size.amount) + Number(amount);
            const product = await Product.update({amount: newAmount}, {where: {id: productId}})
            const updateValue = await Size.update(
                {name, amount},
                {where: {id}});
            return res.json("Данные успешно обновлены")
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async deleteImage(req, res, next) {
        try {
            const {name} = req.body;
            fs.unlinkSync(path.resolve(__dirname, '..', 'static', name));
            await Image.destroy({where: {name}});
            return res.json('Картинка успешно удалена');
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async createImage(req, res, next) {
        try {
            const {productId} = req.body;
            const {image} = req.files;
            if (Array.isArray(image)) {
                for (let i of image) {
                    let fileName = uuid.v4() + '.jpg';
                    i.mv(path.resolve(__dirname, '..', 'static', fileName))
                    Image.create({
                        name: fileName,
                        productId
                    })
                }
            } else {
                let fileName = uuid.v4() + '.jpg';
                image.mv(path.resolve(__dirname, '..', 'static', fileName))
                Image.create({
                    name: fileName,
                    productId
                })
            }
            return res.json("Изображения добавлены");
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

}


module.exports = new ProductController();