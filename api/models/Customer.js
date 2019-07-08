const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');

const hooks = {
  beforeCreate(customer) {
    customer.password = bcryptService().password(customer); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'customer';

const Customer = sequelize.define('Customer', {
  email: {
    type: Sequelize.STRING,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
  },
  credit_card: {
    type: Sequelize.STRING,
  },
  address_1: {
    type: Sequelize.STRING,
  },
  city: {
    type: Sequelize.STRING,
  },
  country: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  region: {
    type: Sequelize.STRING,
  },
  shipping_region_id: {
    type: Sequelize.INTEGER,
  },
  customer_id: {
    type: Sequelize.INTEGER,
    unique: true,
  },
}, { hooks, tableName });

// eslint-disable-next-line
Customer.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  delete values.password;

  return values;
};

module.exports = Customer;
