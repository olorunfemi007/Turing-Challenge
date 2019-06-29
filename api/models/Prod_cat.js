const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');

const hooks = {
  beforeCreate(prod_cat) {
    prod_cat.password = bcryptService().password(prod_cat); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'product_category';

const Prod_cat = sequelize.define('Prod_cat', {
  category_id: {
    type: Sequelize.INTEGER,
  },
  product_id: {
    type: Sequelize.INTEGER,
  },
}, { hooks, tableName });

// eslint-disable-next-line
Prod_cat.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  // console.log(values);

  delete values.password;

  return values;
};

module.exports = Prod_cat;
