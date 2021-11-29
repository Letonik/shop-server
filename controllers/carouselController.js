const uuid = require('uuid');
const path = require('path');
const {Carousel} = require('../models/models');
const ApiError = require('../error/ApiError');
const fs = require('fs');

class CarouselController {
    async show(req, res) {
        const images = await Carousel.findAll();
        return res.json(images);
    }

    async add(req, res, next) {
      try {
          const {title, text} = req.body;
          const {image} = req.files;
          let fileName = uuid.v4() + ".jpg";
          image.mv(path.resolve(__dirname, '..', 'static', fileName));
          await Carousel.create({title, text, image: fileName})
          return res.json('Элемент успешно создан')
      } catch (e) {
          next(ApiError.badRequest(e.message))
      }
    }

    async change(req, res, next) {
        try {
            const {id, title, text} = req.body;
            if (req.files) {
                const {newImage} = req.files;
                const carousel = await Carousel.findOne({where: {id}});
                fs.unlinkSync(path.resolve(__dirname, '..', 'static', carousel.image));
                let fileName = uuid.v4() + ".jpg";
                newImage.mv(path.resolve(__dirname, '..', 'static', fileName));
                const updateValue = await Carousel.update(
                    {image: fileName, title, text},
                    {where: {id}});
            } else {
                const updateValue = await Carousel.update(
                    {title, text},
                    {where: {id}});
            }
            return res.json("Данные успешно обновлены")
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async delete(req, res, next) {
        try {
            const {id} = req.body;
            await Carousel.destroy({where:{id}});
            return res.json('Элемент успешно удален');
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new CarouselController();