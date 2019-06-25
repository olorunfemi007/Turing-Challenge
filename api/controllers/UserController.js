const Customer = require('../models/Customer');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');


const CustomerController = () => {
  const register = async (req, res) => {
    const { body } = req;

    if (body.password === body.password2) {
      try {
        const customer = await Customer.create({
          email: body.email,
          password: body.password,
          address_1: body.address_1,
          city: body.city,
          country: body.country,
          postal_code: body.postal_code,
          region: body.region,
          credit_card: body.credit_card,
        });
        console.log(body.password);
        const token = authService().issue({ id: customer.id });

        return res.status(200).json({ token, customer });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Bad Request: Passwords don\'t match' });
  };

  const login = async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
      try {
        const customer = await Customer
          .findOne({
            where: {
              email,
            },
          });

        if (!customer) {
          return res.status(400).json({ msg: 'Bad Request: Customer not found' });
        }

        if (bcryptService().comparePassword(password, customer.password)) {
          const token = authService().issue({ id: customer.id });

          return res.status(200).json({ token, customer });
        }

        return res.status(401).json({ msg: 'Unauthorized' });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Bad Request: Email or password is wrong' });
  };

  const validate = (req, res) => {
    const { token } = req.body;

    authService().verify(token, (err) => {
      if (err) {
        return res.status(401).json({ isvalid: false, err: 'Invalid Token!' });
      }

      return res.status(200).json({ isvalid: true });
    });
  };

  const getAll = async (req, res) => {
    try {
      const customers = await Customer.findAll();
      

      return res.status(200).json({ customers });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };


  return {
    register,
    login,
    validate,
    getAll,
  };
};

module.exports = CustomerController;
