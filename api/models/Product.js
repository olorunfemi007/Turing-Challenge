const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');

const hooks = {
  beforeCreate(product) {
    product.password = bcryptService().password(product); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'product';

const Product = sequelize.define('Product', {
  description: {
    type: Sequelize.STRING,
    unique: true,
  },
  discounted_price: {
    type: Sequelize.STRING,
  },
  display: {
    type: Sequelize.STRING,
  },
  image: {
    type: Sequelize.STRING,
  },
  image_2: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  price: {
    type: Sequelize.STRING,
  },
  product_id: {
    type: Sequelize.STRING,
  },
  thumbnail: {
    type: Sequelize.INTEGER,
  },
}, { hooks, tableName });

// eslint-disable-next-line
Product.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  delete values.password;

  return values;
};

module.exports = Product;
