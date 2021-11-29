const {Sector, Category} = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class SectorController {
    async show(req, res) {
        const sector = await Sector.findAll({
            include: [
                {model: Category, as: 'categories'}
            ]
        });
        return res.json(sector);
    }

    async add(req, res, next) {
      try {
          let {name} = req.body;
          const {image} = req.files;
          let fileName = uuid.v4() + ".jpg";
          image.mv(path.resolve(__dirname, '..', 'static', fileName));
          const sector = await Sector.create({name, image: fileName})
          return res.json(sector)
      } catch (e) {
          next(ApiError.badRequest(e.message))
      }
    }

    async change(req, res, next) {
        try {
            let {id, name} = req.body;
            if (req.files) {
                const {newImage} = req.files;
                const sector = await Sector.findOne({where: {id}});
                fs.unlinkSync(path.resolve(__dirname, '..', 'static', sector.image));
                let fileName = uuid.v4() + ".jpg";
                newImage.mv(path.resolve(__dirname, '..', 'static', fileName));
                await Sector.update(
                    {image: fileName, name},
                    {where: {id}})
            } else {
                await Sector.update(
                    {name},
                    {where: {id}})
            }
            return res.json('Данные успешно обновлены');
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new SectorController();