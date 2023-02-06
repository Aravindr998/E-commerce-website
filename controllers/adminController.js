const userModel = require('../models/users')
const productModel = require('../models/products')
const orderModel = require('../models/orders')
const fs = require('fs')
const { Parser, transforms: { unwind }  } = require('json2csv')

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
const logoutAdmin = (req, res) => {
  req.session.admin = null
  res.redirect('/admin')
}
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
  } catch (error) {
    console.log(error)
  }
}
const getPdfSalesReport = (req, res) => {
  res.download('./public/files/sales-report.pdf', 'Sale Report.pdf')
}

const getPageNotFound = (req, res) => {
  let admin = false
  if(req.session.admin){
    admin = true
  }
  res.render('admin/404', {admin})
}

module.exports = {
  getLogin,
  redirectHomepage,
  logoutAdmin,
  getDashboard,
  getOrderDetails,
  getProductDetails,
  getSalesReport,
  getPdfSalesReport,
  getPageNotFound
}