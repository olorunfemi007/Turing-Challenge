const Customer = require('../models/Customer');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Category = require('../models/Category');
const Prod_cat = require('../models/Prod_cat');
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
const paypal = require('paypal-rest-sdk');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const date = Date(Date.now());
const hr_temp = date.toString();
console.log(date + 'time log');
const curr_hr = hr_temp.slice(16, 24);
console.log(curr_hr + 'time log');
var i;
var prod;
var quan;
var price;
var total = 0;
var output_prod = [];
var paypalItem = [];

const transporter = nodemailer.createTransport({
  service: "yahoo",
  transport: "SMTP",
  host: "smtp.yahoo.com",
  secureConnection: false,
  port: 587,
  requiresAuth: true,
  auth: {
    user: 'olorunfemikawonise@rocketmail.com',
    pass: ''
  }
});

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

  const socialLogin = (req, res) => {
    const { email, password } = req.body;
    passport.use(new GoogleStrategy({
      clientID: '328771766859-7qjmj8ua6nb17neo2e4e51ac55tlbftp.apps.googleusercontent.com',
      clientSecret: 'ZhJIQwSPN0mQWKjavlB3ADYC',
      callbackURL: "http://www.example.com/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
         User.findOrCreate({ googleId: profile.id }, function (err, user) {
           console.log(user);
           return done(err, user);
         });
    }
  ));

  passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' });

  };
  const updateProfile = async (req, res) => {
    const { email, name, region, country } = req.body;

    try {
      const customer = await Customer
        .findOne({
          where: {
            email,
          },
        });
      if (!customer) {
        return res.status(401).json({ status: 'No record found' });
      }
      else {
        const cust = await Customer
          .update({
            name: country,
            region: region,
          },
            {
              where: { email: email }
            });
        return res.status(200).json({ status: 'update successful ' });
      }
    } catch (err) {
      return res.status(500).json({ status: 'Internal server error' });
    }

  };

  const stripePay = async (req, res) => {
    const { email, customer_id } = req.body;
    var email_text = "Customer ID:" + customer_id + "\n" + "This payment is via your Stripe account" + "\n";
    const cart = await Cart.findAll({
      where: {
        customer_id,
      }
    });
    console.log(cart.length + "................==============");
    total = 0;
    if (cart.length > 1) {
      for (i = 0; i < cart.length; i++) {
        product_id = cart[i].product_id;
        const product = await Product.findOne({
          where: {
            product_id,
          }
        });
        prod = cart[i].product_id;
        quan = cart[i].quantity;
        price = cart[i].price;
        var count = i + 1;
        email_text += count + ". " + product.description + "." + "\n";
        total = total + (quan * price);
        console.log("Total:--------------" + total + i + "......" + quan + "...." + price);
      }
    } else {
      total = cart.quantity * cart.price;
      email_text += count + ". " + product.description + ".";
    }
    console.log("Total:--------------" + total);
    const source = stripe.sources.create({
      type: 'card',
      currency: 'usd',
      owner: {
        email: email
      }
    }, function (err, source) {
      // asynchronously called
    });

    stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2020,
        cvc: '123'
      }
    }, function (err, token) {
      // asynchronously called
      stripe.charges.create({
        amount: total,
        currency: "usd",
        // card: token, // obtained with Stripe.js
        source: token.id,
        description: "Charge for" + email,
      }, function (err, charge) {
        if (!err) {
          var mailOptions = {
            from: 'olorunfemikawonise@rocketmail.com',
            to: email,
            subject: 'Turing Order Invoice',
            text: email_text
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error + "........++++------------***************");
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          return res.status(200).json({ charge });
        } else {
          return res.status(401).json({ err });
        }

      });
    });
    // console.log(stripeToken + 'log................' )



  };

  const paypalPay = async (req, res) => {
    const { email, customer_id } = req.body;
    var email_text = "Customer ID:" + customer_id + "\n" + "This payment is via your Paypal account" + "\n";
    const cart = await Cart.findAll({
      where: {
        customer_id,
      }
    });
    total = 0;
    if (cart.length > 1) {
      for (i = 0; i < cart.length; i++) {
        product_id = cart[i].product_id;
        const product = await Product.findOne({
          where: {
            product_id,
          }
        });
        prod = cart[i].product_id;
        quan = cart[i].quantity;
        price = cart[i].price;
        var count = i + 1;
        email_text += count + ". " + product.description + "." + "\n";
        total = total + (quan * price);
        console.log("Total:--------------" + total + i + "......" + quan + "...." + price);
        var holder = {
          "name": product.name,
          "sku": "item",
          "price": price,
          "currency": "USD",
          "quantity": quan
        };
        paypalItem.push(holder);
      }
    } else {
      total = cart.quantity * cart.price;
      email_text += count + ". " + product.description + ".";
      var holder = {
        "name": "name",
        "sku": "item",
        "price": cart.price,
        "currency": "USD",
        "quantity": cart.quantity
      };
      paypalItem.push(holder);
    }
    console.log(paypalItem);

    paypal.configure({
      'mode': 'sandbox', //sandbox or live
      'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
      'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
    });

    var create_payment_json = {
      "intent": "authorize",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://return.url",
        "cancel_url": "http://cancel.url"
      },
      "transactions": [{
        "item_list": {
          "items": paypalItem
        },
        "amount": {
          "currency": "USD",
          "total": total
        },
        "description": "This is Paypal Payment."
      }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        res.status(401).json({ error });
      } else {
        res.status(200).json({ payment });
        var mailOptions = {
          from: 'olorunfemikawonise@rocketmail.com',
          to: email,
          subject: 'Turing Order Invoice',
          text: email_text
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error + "........++++------------***************");
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        console.log(payment);
      }
    });
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
      var customers = await Customer.findAll();
      if (customers.length > 10) {                           // this is to support paging (10 records per page)
        if (page == 1) {
          pg = 0;
          pg_last = 10;
        }
        else {
          page = page - 1;
          pg = page * 10;
          pg_last = pg + 10;
        }
        // console.log('log.. ' + pg + pg_last + 'log............');
        var customers = customers.slice(pg, pg_last);

      }
      return res.status(200).json({ customers });



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
    const { name, attributes, quantity, buy_now, email } = req.body;
    try {
      const product = await Product.findOne({
        where: {
          name,
        }
      });
      const customer = await Customer.findOne({
        where: {
          email,
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
          customer_id: customer.customer_id,
          price: product.price,
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

      if (!category_id | !department_id) {
        return res.status(401).json({ status: 'Put in Category ID and Department ID' });
      }
      else {
        const category = await Category.findOne({
          where: {
            category_id,
            department_id,
          }
        });
        if (!category) {
          return res.status(401).json({ status: 'No category with this selection criteria' });
        }

        category_id = category.category_id;
        const prod_cat = await Prod_cat.findAll({
          where: {
            category_id,
          }
        });

        for (i = 0; i < prod_cat.length; i++) {
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
    stripePay,
    paypalPay,
    socialLogin,
  };
};

module.exports = CustomerController;
