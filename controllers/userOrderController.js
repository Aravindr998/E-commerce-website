const userModel = require('../models/users')
const productModel = require('../models/products')
const couponModel = require('../models/coupons')
const paymentModel = require('../models/payment')
const mongoose = require('mongoose')
const orderModel = require('../models/orders')
const Razorpay = require('razorpay')


const getOrdersPage = async(req, res) => {
  try {
    const orders = await orderModel.find({customerId: req.session.user._id}).sort({createdAt: -1})
    res.render('users/orders', {orders, user: req.session?.user?.fname})
  } catch (error) {
    
  }
}

const getOrderDetails = async(req, res) => {
  try {
    const orderId = req.params.id
    const order = await orderModel.findById(orderId)
    .populate('payment')
    res.render('users/order-details', {order, user: req.session?.user?.fname})
  } catch (error) {
    
  }
}

const cancelOrder = async(req, res) => {
  try {
    await orderModel.updateMany({
      items: {
        $elemMatch: {
          _id: req.body.id
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
              _id: mongoose.Types.ObjectId(req.body.id)
            }
          }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items._id': mongoose.Types.ObjectId(req.body.id)
        }
      },
      {
        $project: {
          'items.skuId': 1,
          'items.quantity': 1
        }
      }
    ])
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
    const order = await orderModel.findOne({items: {$elemMatch: {_id: req.body.id}}})
    if(order.paymentMethod == 'Razorpay' && order.paymentVerified == true){
      const amount = await orderModel.aggregate([
        {
          $unwind: '$items'
        },
        {
          $match: {
            'items._id': mongoose.Types.ObjectId(req.body.id)
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
    console.log(true)
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const createOrder = async(req, res) => {
  if(!req.body.address){
    req.session.Errmessage = 'Please add an address'
    res.redirect('/checkout')
  }
  try {
    const users = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.session.user._id)
        }
      },
      {
        $unwind: '$shippingAddress'
      },
      {
        $match: {
          'shippingAddress._id': mongoose.Types.ObjectId(req.body.address)
        }
      }
    ])
    const user = users[0]
    const order = new orderModel({
      customerId: req.session.user._id,
      'address.street1': user.shippingAddress.street1,
      'address.street2': user.shippingAddress.street2,
      'address.city': user.shippingAddress.city,
      'address.state': user.shippingAddress.state,
      'address.zip': user.shippingAddress.zip,
      phone: user.phone,
      totalAmount: Math.round(user.cartTotal * 1.18),
      paymentMethod: 'Razorpay',
      paymentVerified: false,
    })
    if(req.body.couponId){
      order.couponId = req.body.couponId
      const coupon = await couponModel.findById(req.body.couponId)
      if(coupon.users.includes(req.session.user._id)){
        return res.redirect('/checkout')
      }
      let discount;
      if(coupon.minPurchaseValue){
        if(user.cartTotal < coupon.minPurchaseValue){
          req.session.couponApplied = null
          return res.redirect('/checkout')
        } 
        if(coupon.isPercentage){
          discount = user.cartTotal * coupon.discount/100
        }else{
          discount = coupon.discount
        }
        req.session.couponApplied = null
      }
      order.totalAmount = Math.round(user.cartTotal * 1.18 - discount)
      await couponModel.findOneAndUpdate({_id: req.body.couponId}, {$push: {users: req.session.user._id}})
    }
    let skuId = []
    user.cart.forEach(item => {
      skuId.push(item.skuId)
    })
    const user1 = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.session.user._id)
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'cart.skuId',
          foreignField: 'skus._id',
          pipeline: [
            {
              $unwind: '$skus'
            },
            {
              $match: {
                'skus._id': {
                  $in: skuId
                }
              }
            }
          ],
          as: 'skus1'
        }
      },
      {
        $set: {
          'cart': {
            $map: {
              input: '$cart',
              as: 's',
              in: {
                $mergeObjects: [
                  '$$s',
                  {
                    skus: {
                      $filter: {
                        input:'$skus1',
                        as: 's2',
                        cond: {$eq: ['$$s2._id', '$$s.productId']}
                      }
                    } 
                  }
                ]
              }
            }
          }
        }
      },
      {
        $unset: ['skus1']
      }
    ])
    user1[0].cart.forEach(item => {
      const items = {
        productId: item.productId,
        skuId: item.skuId,
        productName: item.skus[0].title,
        color: item.skus[0].skus.color,
        quantity: item.quantity,
        price: item.skus[0].skus.price,
        image: item.skus[0].skus.images[0],
        orderStatus: 'Pending'
      }
      order.items.push(items)
    })
    await order.save()
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    })
    instance.orders.create({
      amount: order.totalAmount*100,
      currency: "INR",
      receipt: order._id.toString()
    }, (err, orderInstance) => {
      if(err){
        console.log(err)
        return res.json({successStatus: false})
      }
      console.log(orderInstance)
      return res.json({
        successStatus: true,
        orderInstance,
        user: user1[0]
      })
    })
  } catch (error) {
    console.log(error)
    req.session.Errmessage = 'Some error occured please try again later'
    res.json({successStatus: false})
  }
}

const downloadInvoice = async(req, res) => {
  res.download(`./public/invoice/${req.params.id}.pdf`, 'Invoice.pdf')
}


module.exports = {
  getOrdersPage,
  getOrderDetails,
  cancelOrder,
  createOrder,
  downloadInvoice
}