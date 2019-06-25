const bcrypt = require('bcrypt-nodejs');

const bcryptService = () => {
  const password = (customer) => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(customer.password, salt);

    return hash;
  };

  const comparePassword = (pw, hash) => (
    bcrypt.compareSync(pw, hash)
  );

  return {
    password,
    comparePassword,
  };
};

module.exports = bcryptService;
