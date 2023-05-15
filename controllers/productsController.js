const { where } = require('sequelize');
const model = require('../models')
const sequelize = require('sequelize');
const Op = sequelize.Op;

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
  let keyword = req.query.keyword || "";
  let sort = ['price', 'newest', 'popular'].includes(req.query.sort) ? req.query.sort : "price";
  let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page));

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
  if (keyword.trim() != '') {
    option.where.name = {
      [Op.like]: `%${keyword}%`
    }
  }
  switch (sort) {
    case 'newest':
      option.order = [['createdAt', "DESC"]]
      break;
    case 'popular':
      option.order = [['stars', "DESC"]]
      break;
    default:
      option.order = [['price', "ASC"]]
      break;
  }
  res.locals.sort = sort;
  res.locals.originalUrl = removeParam('sort', req.originalUrl);
  if (Object.keys(req.query).length == 0) {
    res.locals.originalUrl = res.locals.originalUrl + "?";
  }

  const limit = 6;
  option.limit = limit;
  option.offset = limit * (page - 1);
  let { rows, count } = await model.Product.findAndCountAll(option)
  res.locals.pagination = {
    page: page,
    limit: limit,
    totalRows: count,
    queryParams: req.query
  }
  // const products = await model.Product.findAll(option);
  res.locals.products = rows;
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
    }, {
      model: model.Tag,
      attributes: ['id']
    }]
  });
  res.locals.product = product
  
  let tagIds = [];
  product.Tags.forEach(tag => tagIds.push(tag.id));
  let relatedProducts = await model.Product.findAll({
    include: [{
      model: model.Tag,
      where: {
        id: { [Op.in]: tagIds }
      }
    }],
    limit: 10
  })
  res.locals.relatedProducts = relatedProducts
  res.render('product-detail')


}

function removeParam(key, sourceURL) {
  var rtn = sourceURL.split("?")[0],
      param,
      params_arr = [],
      queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
      params_arr = queryString.split("&");
      for (var i = params_arr.length - 1; i >= 0; i -= 1) {
          param = params_arr[i].split("=")[0];
          if (param === key) {
              params_arr.splice(i, 1);
          }
      }
      if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}

module.exports = controller;