const userModel = require('../models/users')
const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const bannerModel = require('../models/banners')
const orderModel = require('../models/orders')
const couponModel = require('../models/coupons')
const paymentModel = require('../models/payment')
const mongoose = require('mongoose')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const path = require('path')
const { Parser, transforms: { unwind }  } = require('json2csv')
const Razorpay = require('razorpay')

const getLogin = (req, res) => {
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    req.session.Errmessage = null
    res.render('admin/admin-login', {message})
  }else{
    const message = ""
    res.render('admin/admin-login', {message})
  }
}



const redirectHomepage = async(req, res) => {
  return res.redirect('/admin')
}



//user management

const logoutAdmin = (req, res) => {
  req.session.admin = null
  res.redirect('/admin')
}

//category management



//banner management


//order management





const getDashboard = async(req, res) => {
  try {
    const orders = await orderModel.aggregate([
      {
        $unwind: '$items' 
      },
      {
        $match: {
          isCancelled: false,
          paymentVerified: true
        }
      }
    ])
    const users = await userModel.find()
    const totalSales = orders.reduce((sum, order) => sum+=order.totalAmount, 0)
    const products = await productModel.find()
    res.render('admin/dashboard/dashboard', {orders, totalSales, users, products})
  } catch (error) {
    console.log(error)
  }
}

const getOrderDetails = async(req, res) => {
  try {
    const orders = await orderModel.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          isCancelled: false,
          paymentVerified: true
        }
      },
      {
        $group: {
          _id: {$dayOfYear: '$createdAt'},
          date: {$first: '$createdAt'},
          totalSpent: {$sum: '$totalAmount'} 
        }
      },
      {
        $sort: {
          date: 1
        }
      }

    ])
    console.log(orders);
    res.json({orders})
  } catch (error) {
    console.log(error)
  }
}

const getProductDetails = async(req, res) => {
  try {
    const products = await orderModel.aggregate([
      {
        $unwind: '$items'
      },
      {
        $addFields: {
          currMonth: {
            '$month' : new Date()
          },
          docMonth: {
            '$month': '$createdAt'
          }
        }
      },
      {
        $match: {
          isCancelled: false,
          paymentVerified: true,
          $expr: {
            $eq: ['$currMonth', '$docMonth']
          }
        }
      },
      {
        $group: {
          _id: '$items.skuId',
          product: {$first: '$items.productName'},
          color: {$first: '$items.color'},
          quantity: {$sum: '$items.quantity'}
        }
      }
    ])
    console.log(products)
    res.json({products})
  } catch (error) {
    console.log(error)
  }
}

const getSalesReport = async(req, res) => {
  try {
    const orders = await orderModel.aggregate([
      {
        $unwind: '$items'
      },
      {
        $addFields: {
          currMonth: {
            '$month' : new Date()
          },
          docMonth: {
            '$month': '$createdAt'
          }
        }
      },
      {
        $match: {
          isCancelled: false,
          paymentVerified: true,
          $expr: {
            $eq: ['$currMonth', '$docMonth']
          }
        }
      },
      {
        $lookup: {
          from: 'coupons',
          localField: 'couponId',
          foreignField: '_id',
          pipeline: [{
            $project: {
              code: 1
            }
          }],
          as: 'couponDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          pipeline: [{
            $project: {
              fname: 1,
              lname: 1,
              email: 1
            }
          }],
          as: 'customerId'
        }
      }
    ])
    const fields = [
      {
        label: 'Customer Name',
        value: 'customerId.fname'
      },
      {
        label: 'Email',
        value: 'customerId.email'
      },
      {
        label: 'Payment Method',
        value: 'paymentMethod'
      },
      {
        label: 'Product',
        value: 'items.productName'
      },
      {
        label: 'Color',
        value: 'items.color'
      },
      {
        label: 'Quantity',
        value: 'items.quantity'
      },
      {
        label: 'Coupon',
        value: 'couponDetails.code'
      },
      {
        label: 'Ordered On',
        value: 'createdAt'
      }
    ]
    const transforms = [unwind({ paths: ['couponDetails', 'customerId'] })]
    const json2csvParser = new Parser({ fields, transforms })
    const csv = json2csvParser.parse(orders)
    fs.writeFileSync('./public/files/data.csv', csv)
    res.download('./public/files/data.csv', 'Sales Report.csv')
    console.log(orders)
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getLogin,
  redirectHomepage,
  logoutAdmin,
  getDashboard,
  getOrderDetails,
  getProductDetails,
  getSalesReport
}