const development = {
  database: 'turing',
  username: 'root',
  password: 'root',
  port: 8889,
  host: 'localhost',
  dialect: 'mysql',
};

const testing = {
  database: 'turing',
  username: 'root',
  password: 'root',
  port: 8889,
  host: 'localhost',
  dialect: 'mysql',
};

const production = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST || 'localhost',
  dialect: 'sqlite' || 'mysql' || 'postgres',
};

module.exports = {
  development,
  testing,
  production,
};
