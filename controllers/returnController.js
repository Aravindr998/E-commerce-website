const productModel = require('../models/products')
const orderModel = require('../models/orders')
const paymentModel = require('../models/payment')
const mongoose = require('mongoose')
const Razorpay = require('razorpay')

const getReturnPage = async(req, res) => {
  try {
    const returns = await orderModel.find({return: true})
    .populate('customerId')
    .sort({createdAt: -1})
    res.render('admin/returns/returns', {returns})
  } catch (error) {
    console.log(error)
  }
}

const acceptReturn = async(req, res) => {
  try {
    const {id, status} = req.body
    if(status == 'accept'){
      await orderModel.findOneAndUpdate({_id: id}, {$set: {returnStatus: 'Accepted'}})
    }else{
      await orderModel.findOneAndUpdate({_id: id}, {$set: {returnStatus: 'Declined'}})
    }
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const changeReturnStatus = async(req, res) => {
  try {
    const {orderId, value} = req.body
    const order = await orderModel.findOneAndUpdate({_id: orderId}, {$set: {returnStatus: value}})
    if(value == 'Refund Initiated' && order.paymentMethod == 'Razorpay' && order.paymentVerified == true){
      let refund
      const payment = await paymentModel.findOne({orderId})
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
    return res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    return res.json({successStatus: false})
  }
}

module.exports = {
  getReturnPage,
  acceptReturn,
  changeReturnStatus
}