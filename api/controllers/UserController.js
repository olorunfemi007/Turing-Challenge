const Customer = require('../models/Customer');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Category = require('../models/Category');
const Prod_cat = require('../models/Prod_cat');

    const date = Date(Date.now()); 
    const hr_temp = date.toString();
    console.log(date + 'time log');
    const curr_hr = hr_temp.slice(16, 24);
    console.log(curr_hr + 'time log');
    var i;
    var output_prod = [];

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
          name: body.name,
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

  const updateProfile = async (req, res) => {
      const {email, name, region, country} = req.body;
  
      try{
        const customer = await Customer
        .findOne({
          where: {
            email,
          },
        });
        if (!customer){
          return res.status(401).json({status:'No record found'});
        }
        else{
          const cust = await Customer
        .update({
          name:country,
          region:region,
        },
        {
          where: { email:email }
        });
        return res.status(200).json({status:'update successful '});
        }
      }catch (err) {
        return res.status(500).json({status:'Internal server error'});
      }
      
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
    var { page } = req.body;
    var pg;
    var pg_last;
    try {
      const customers = await Customer.findAll();
      if (customers.length > 10){                           // this is to support paging (10 records per page)
        if (page == 1){
            pg = 0;
            pg_last = 10;
        }
        else {
          page = page - 1;
          pg = page * 10;
          pg_last = pg + 10;
        }
        // console.log('log.. ' + pg + pg_last + 'log............');
        var cust_rec = customers.slice(pg, pg_last);
        return res.status(200).json({ cust_rec });
      } else {
        return res.status(200).json({ customers });
      }


      
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };

  const getItem = async (req, res) => {
    const { name } = req.body;
    try {
      const product = await Product.findOne({
        where: {
          name,
        }
      });
       if (!product) {
         return res.status(400).json({ status: 'No Item Found' });
       } 

      return res.status(200).json({ product });
    } catch (err) {
      console.log(err);
      return res.status(401).json({ status: 'Error' });
    }
  };

  const addCart = async (req, res) => {
    const { name, attributes, quantity, buy_now } = req.body;
    try {
      const product = await Product.findOne({
        where: {
          name,
        }
      });
       if (!product) {
         return res.status(400).json({ status: 'No Item Found' });
       } else {
         const cart = await Cart.create({
          //  attribute: attributes,
           product_id: product.product_id,
           quantity: quantity,
           cart_id: product.id,
           buy_now: buy_now,
           added_on: curr_hr,
         });
         return res.status(200).json({ cart });
       }
 

      
    } catch (err) {
      console.log(err);
      return res.status(401).json({ status: 'Error' });
    }
  };

  const itemDeptCat = async (req, res) => {
    const { department_id } = req.body;
    var { category_id, product_id } = req.body;
    try {
      
      if (!category_id | !department_id){
          return res.status(401).json({status: 'Put in Category ID and Department ID'});
      }
      else{
      const category = await Category.findOne({
        where: {
          category_id,
          department_id,
        }
      });
      if (!category){
        return res.status(401).json({status: 'No category with this selection criteria'});
      }

      category_id = category.category_id;
      const prod_cat = await Prod_cat.findAll({
        where: {
          category_id,
        }
      });

      for (i=0; i<prod_cat.length; i++) {
        product_id = prod_cat[i].product_id;
        // console.log(prod_cat[i] + i + ' log.................');
        console.log(prod_cat.length);
        var product = await Product.findOne({
      where: {
        product_id,
      }
    });
    //  object = product;
     output_prod.push(product);
    }
    
    // console.log(output_prod);
     if (!output_prod) {
       return res.status(400).json({ status: 'No Item Found' });
     } 

    return res.status(200).json({ output_prod });
      }

      
      
      // console.log(category);
      // console.log(Prod_cats)
      // return res.status(200).json({ Prod_cat });
      
      
    } catch (err) {
      console.log(err);
      return res.status(401).json({ status: 'Error' });
    }
    
    
  };

  return {
    register,
    login,
    validate,
    getAll,
    getItem,
    addCart,
    itemDeptCat,
    updateProfile,
  };
};

module.exports = CustomerController;
