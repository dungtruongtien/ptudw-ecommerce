const { where } = require('sequelize');
const model = require('../models')
let controller = {};

controller.show = async (req, res) => {
  let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
  let brand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);

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

  const products = await model.Product.findAll(option);
  res.locals.products = products;
  res.render('product-list');
}

module.exports = controller;