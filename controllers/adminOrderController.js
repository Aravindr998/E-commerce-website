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
  const {orderId , orderStatus} = req.body
  try {
    const order = await orderModel.findOneAndUpdate({
      _id: orderId
    },
    {
      $set: {
        orderStatus: orderStatus
      }
    })
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const cancelOrder = async(req, res) => {
  const {orderId} = req.body
  try {
    const order = await orderModel.findOneAndUpdate({
      _id: orderId
    }, 
    {
      $set: {
        isCancelled: true
      }
    })
    for(let item of order.items){
      await productModel.findOneAndUpdate({
        skus: {
          $elemMatch: {
            _id: mongoose.Types.ObjectId(item.skuId)
          }
        }
      },
      {
        $set: {
          'skus.$.totalStock': item.quantity
        }
      })
    }
    if(order.paymentMethod == 'Razorpay' && order.paymentVerified == true){
      let refund
      const payment = await paymentModel.findOne({orderId: order._id})
      const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET_KEY })
      instance.payments.refund(payment.paymentId,{
        "amount": order.totalAmount*100,
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