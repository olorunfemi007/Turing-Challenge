const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');

const hooks = {
  beforeCreate(category) {
    category.password = bcryptService().password(category); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'category';

const Category = sequelize.define('Category', {
  category_id: {
    type: Sequelize.INTEGER,
  },
  department_id: {
    type: Sequelize.INTEGER,
  },
}, { hooks, tableName });

// eslint-disable-next-line
Category.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  // console.log(values);

  delete values.password;

  return values;
};

module.exports = Category;
