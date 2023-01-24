const productModel = require('../models/products')
const orderModel = require('../models/orders')
const paymentModel = require('../models/payment')
const mongoose = require('mongoose')
const Razorpay = require('razorpay')

const getOrdersPage = async(req, res) => {
  try {
    const orders = await orderModel.find()
    .populate('customerId')
    .sort({createdAt: -1})
    res.render('admin/orders/order', {orders})
  } catch (error) {
    console.log(error)
  }
}

const changeOrderStatus = async(req, res) => {
  try {
    const order = await orderModel.findOneAndUpdate({
      items: {
        $elemMatch: {
          _id: req.body.itemId
        }
      }
    },
    {
      'items.$.orderStatus': req.body.orderStatus
    })
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const cancelOrder = async(req, res) => {
  try {
    await orderModel.updateMany({
      items: {
        $elemMatch: {
          _id: req.body.itemId
        }
      }
    }, 
    {
      $set: {
        'items.$.isCancelled': true
      }
    })
    const quantity = await orderModel.aggregate([
      {
        $match: {
          items: {
            $elemMatch: {
              _id: mongoose.Types.ObjectId(req.body.itemId)
            }
          }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items._id': mongoose.Types.ObjectId(req.body.itemId)
        }
      },
      {
        $project: {
          'items.skuId': 1,
          'items.quantity': 1
        }
      }
    ])
    console.log(quantity)
    await productModel.findOneAndUpdate({
      skus: {
        $elemMatch: {
          _id: quantity[0].items.skuId
        }
      }
    },
    {
      $inc: {
        'skus.$.totalStock': quantity[0].items.quantity
      }
    })
    const order = await orderModel.findOne({items: {$elemMatch: {_id: req.body.itemId}}})
    if(order.paymentMethod == 'Razorpay' && order.paymentVerified == true){
      const amount = await orderModel.aggregate([
        {
          $unwind: '$items'
        },
        {
          $match: {
            'items._id': mongoose.Types.ObjectId(req.body.itemId)
          }
        }
      ])
      console.log(amount)
      console.log('entered')
      let refund
      const payment = await paymentModel.findOne({orderId: order._id})
      const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET_KEY })
      instance.payments.refund(payment.paymentId,{
        "amount": amount[0].items.price*100,
        "speed": "normal",
        "receipt": payment._id
      }, async(err, refundDetails) => {
        if(err){
          console.log(err)
        }
        refund = refundDetails
        await paymentModel.findOneAndUpdate({orderId: order._id}, {$set: {refund: true, refundId: refund.id}})
      })
    }
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

module.exports = {
  getOrdersPage,
  changeOrderStatus,
  cancelOrder
}