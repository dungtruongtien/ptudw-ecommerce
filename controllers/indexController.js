const model = require('../models')

const controller = {};

controller.showHomepage = async (req, res) => {
  const recentProducts = await model.Product.findAll({
    attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
    order: [['createdAt', 'DESC']],
    limit: 10
  });
  res.locals.recentProducts = recentProducts;

  const featureProducts = await model.Product.findAll({
    attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
    order: [['stars', 'DESC']],
    limit: 10
  });
  res.locals.featureProducts = featureProducts;

  const categories = await model.Category.findAll();
  const secondArray = categories.splice(2,2);
  const thirdArray = categories.splice(1,1);
  res.locals.categoryArray = {
    categories,
    secondArray,
    thirdArray
  }
  const Brand = model.Brand;
  const brands = await Brand.findAll();
  res.render('index', { brands })
}

controller.showPage  = (req, res, next) => {
  const pages = ["cart", "checkout", "contact", "index", "login", "my-account", "product-detail", "product-list", "wishlist"];
  if (pages.includes(req.params.page)) {
    return res.render(req.params.page)
  }
  next();
}

module.exports = controller;