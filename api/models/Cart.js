const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');

const hooks = {
  beforeCreate(shopping_cart) {
    shopping_cart.password = bcryptService().password(shopping_cart); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'shopping_cart';

const Cart = sequelize.define('Cart', {
  added_on: {
    type: Sequelize.STRING,
  },
  
  buy_now: {
    type: Sequelize.TINYINT,
  },
  item_id: {
    type: Sequelize.INTEGER,
  },
  product_id: {
    type: Sequelize.INTEGER,
  },
  quantity: {
    type: Sequelize.INTEGER,
  },
  cart_id: {
    type: Sequelize.INTEGER,
  },
  customer_id: {
    type: Sequelize.INTEGER,
  },
  price: {
    type: Sequelize.DECIMAL,
  },
}, { hooks, tableName });

// eslint-disable-next-line
Cart.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  // console.log(values);

  delete values.password;

  return values;
};

module.exports = Cart;
