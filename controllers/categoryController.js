const {Category} = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const {Review} = require("../models/models");
const {Size} = require("../models/models");
const {ProductInfo} = require("../models/models");
const {Product} = require("../models/models");
const {Image} = require("../models/models");
const fs = require('fs');

class CategoryController {
    async show(req, res) {
        const {sectorId} = req.params;
        const categories = await Category.findAll({where: {sectorId}});
        return res.json(categories);
    }

    async add(req, res, next) {
        try {
            let {name, sectorId} = req.body;
            const {image} = req.files;
            let fileName = uuid.v4() + ".jpg";
            image.mv(path.resolve(__dirname, '..', 'static', fileName));
            const category = await Category.create({name, sectorId, image: fileName})
            return res.json('Категория успешно создана')
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async delete(req, res, next) {
        try {
            const {id} = req.body;
            const products = await Product.findAll({where: {categoryId: id}});
            for (let product of products) {
                await ProductInfo.destroy({where: {productId: product.id}})
                await Size.destroy({where: {productId: product.id}})
                await Review.destroy({where: {productId: product.id}})
                await Image.destroy({where: {productId: product.id}})
                await Product.destroy({where: {id: product.id}})
            }
            const category = await Category.findOne({where: {id}});
            fs.unlinkSync(path.resolve(__dirname, '..', 'static', category.image));
            await Category.destroy({where: {id}});
            return res.json('Категория успешно удалена');
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async change(req, res, next) {
        try {
            const {id, name} = req.body;
            if (req.files) {
                const {newImage} = req.files;
                const category = await Category.findOne({where: {id}});
                fs.unlinkSync(path.resolve(__dirname, '..', 'static', category.image));
                let fileName = uuid.v4() + ".jpg";
                newImage.mv(path.resolve(__dirname, '..', 'static', fileName));
                const updateValue = await Category.update(
                    {image: fileName, name},
                    {where: {id}});
            } else {
                const updateValue = await Category.update(
                    {name},
                    {where: {id}});
            }
            return res.json("Данные успешно обновлены")
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

}

module.exports = new CategoryController();