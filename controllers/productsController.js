const { where } = require('sequelize');
const model = require('../models')
let controller = {};

controller.getData = async (req, res, next) => {
  const categories = await model.Category.findAll({
    include: [{
      model: model.Product
    }]
  });
  res.locals.categories = categories;

  let brands = await model.Brand.findAll({
    include: [{
      model: model.Product
    }]
  })
  res.locals.brands = brands;

  let tags = await model.Tag.findAll();
  res.locals.tags = tags;

  next();
}

controller.show = async (req, res) => {
  let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
  let brand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
  let tag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);


  const option = {
    attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
    where: {}
  }
  if (category > 0) {
    option.where.categoryId = category;
  }
  if (brand > 0) {
    option.where.brandId = brand;
  }
  if (tag > 0) {
    option.include = [{
      model: model.Tag,
      where: { id: tag }
    }]
  }

  const products = await model.Product.findAll(option);
  res.locals.products = products;
  res.render('product-list');
}

controller.showDetails = async (req, res) => {
  let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
  let product = await model.Product.findOne({
    where: { id },
    include: [{
      model: model.Image,
      attributes: ['name', 'imagePath']
    }, {
      model: model.Review,
      attributes: ['id', 'review', 'stars', 'createdAt']
    }, {
      model: model.User,
      attributes: ['firstName', 'lastName']
    }]
  });
  res.locals.product = product
  res.render('product-detail')
}

module.exports = controller;