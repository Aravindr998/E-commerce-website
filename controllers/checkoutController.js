const userModel = require('../models/users')
const productModel = require('../models/products')
const couponModel = require('../models/coupons')
const paymentModel = require('../models/payment')
const mongoose = require('mongoose')
const orderModel = require('../models/orders')
const crypto = require('crypto')

const getCheckoutPage = async(req, res) => {
  let message = ''
  if(req.session.Errmessage){
    message = req.session.Errmessage
    req.session.Errmessage = null
  }
  let discount = {}
  if(req.session.couponApplied){
    discount = req.session.couponApplied
  }
  console.log(discount)
  try {
    const user = await userModel.findById(req.session.user._id)
    let skuId = []
    user.cart.forEach(item => {
      skuId.push(item.skuId)
    })
    if(user.cart.length>0){
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
      const coupons = await couponModel.find()
      res.render('users/checkout', {userDetails: user1[0], message, coupons, discount, user: req.session?.user?.fname})
    }else{
      res.redirect('/cart')
    }
  } catch (error) {
    console.log(error)
  }
}

const checkoutCod = async(req, res) => {
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
    const cart = await userModel.findById(req.session.user._id)
      .populate('cart.productId')
      if(cart.cart.length>0){
        cart.cart.forEach((item, index, array) => {
          let temp
          item.productId.skus.forEach( sku => {
            if(sku._id.toString() == item.skuId.toString()){
              temp = sku
            }
          })
          array[index].skus = temp
        })
      }
    const total = cart.cart.reduce((sum, item) => sum+=(item.productId.offerPercent ? Math.round(item.skus[0].price * (1 - item.productId.offerPercent/100)) : item.skus[0].price) * item.quantity, 0)
    console.log(total)
    const user = users[0]
    const order = new orderModel({
      customerId: req.session.user._id,
      'address.street1': user.shippingAddress.street1,
      'address.street2': user.shippingAddress.street2,
      'address.city': user.shippingAddress.city,
      'address.state': user.shippingAddress.state,
      'address.zip': user.shippingAddress.zip,
      phone: user.phone,
      totalAmount: Math.round(total * 1.18),
      paymentMethod: 'COD',
      paymentVerified: true,
    })
    if(req.body.couponId){
      order.couponId = req.body.couponId
      const coupon = await couponModel.findById(req.body.couponId)
      if(coupon.users.includes(req.session.user._id)){
        return res.redirect('/checkout')
      }
      let discount;
      if(coupon.minPurchaseValue){
        if(total < coupon.minPurchaseValue){
          req.session.couponApplied = null
          return res.redirect('/checkout')
        } 
        if(coupon.isPercentage){
          discount = total * coupon.discount/100
        }else{
          discount = coupon.discount
        }
        req.session.couponApplied = null
      }
      order.totalAmount = Math.round(total * 1.18 - discount)
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
        price: item.skus[0].offerPercent ? Math.round(item.skus[0].skus.price * (1 - item.skus[0].offerPercent/100)) : item.skus[0].skus.price,
        image: item.skus[0].skus.images[0]
      }
      order.items.push(items)
    })
    for( let item of user1[0].cart){
      await productModel.findOneAndUpdate({
        skus:{
          $elemMatch: {
            _id: mongoose.Types.ObjectId(item.skuId)
          }
        }
      },
      {
        $inc: {
          'skus.$.totalStock': -item.quantity
        }
      })
    }
    await order.save()
    await userModel.findOneAndUpdate({
      _id: req.session.user._id
    },
    {
      $set:{
        cart: []
      }
    })
    req.session.orderplaced = true
    return res.redirect('/orderplaced')
  } catch (error) {
    console.log(error)
  }
}
const getOrderPlacedPage = (req, res) => {
  if(req.session.orderplaced){
    req.session.orderplaced = null
  return res.render('users/order-placed', {user: req.session?.user?.fname})
  }else{
    return res.redirect('/')
  }
}

const addCoupon = async(req, res) => {
  try {
    const coupon = await couponModel.findById(req.body.id)
    const user = await userModel.findById(req.session.user._id)
    .populate('cart.productId')
    if(user.cart.length>0){
      user.cart.forEach((item, index, array) => {
        let temp
        item.productId.skus.forEach( sku => {
          if(sku._id.toString() == item.skuId.toString()){
            temp = sku
          }
        })
        array[index].skus = temp
      })
    }
    let discount;
    if(coupon.users.includes(req.session.user._id)){
      return res.json({
        successStatus: false,
        message: 'You have already availed this offer'
      })
    }
    console.log(user.cart[0].skus)
    const total = user.cart.reduce((sum, item) => sum+=(item.productId.offerPercent ? Math.round(item.skus[0].price * (1 - item.productId.offerPercent/100)) : item.skus[0].price) * item.quantity, 0)
    console.log(total)
    if(coupon.minPurchaseValue){
      if(total < coupon.minPurchaseValue){
        return res.json({
          successStatus: false,
          message: `Please add items worth Rs. ${coupon.minPurchaseValue - total} more to avail this offer`
        })
      } 
      if(coupon.isPercentage){
        discount = total * coupon.discount/100
      }else{
        discount = coupon.discount
      }
      req.session.couponApplied = {
        discount,
        couponId: coupon._id,
        couponCode: coupon.code
      }
      console.log(req.session.couponApplied)
      return res.json({
        successStatus: true
      })
    }
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false,
      message: 'Some error occured. Please try again later'
    })
  }
}

const getFailurePage = async(req, res) => {
  res.render('users/payment-failed', {user: req.session?.user?.fname})
}


const verifyPayment = async(req, res) => {
  try {
    console.log(req.body.payment)
    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
    hmac.update(req.body.payment['razorpay_order_id']+'|'+req.body.payment['razorpay_payment_id'])
    hmac = hmac.digest('hex')
    if(hmac == req.body.payment['razorpay_signature']){
      const order = await orderModel.findOneAndUpdate({_id: req.body.order.receipt}, {
        $set: {
          'items.$[].orderStatus': 'Placed',
          paymentVerified: true
        }
      })
      if(order.couponId){
        await couponModel.findOneAndUpdate({_id: order.couponId}, {$push: {users: req.session.user._id}})
      }
      for(let item of order.items){
        await productModel.findOneAndUpdate({
          skus:{
            $elemMatch: {
              _id: mongoose.Types.ObjectId(item.skuId)
            }
          }
        },
        {
          $inc: {
            'skus.$.totalStock': -item.quantity
          }
        })
      }
      await userModel.findOneAndUpdate({
        _id: req.session.user._id
      },
      {
        $set:{
          cart: [],
        }
      })
      const payment = new paymentModel({
        orderId: req.body.order.receipt,
        customerId: req.session.user._id,
        paymentId: req.body.payment['razorpay_payment_id'],
        razorpayOrderId: req.body.payment['razorpay_order_id'],
        paymentSignature: req.body.payment['razorpay_signature'],
        status: true
      })
      await payment.save()
      req.session.orderplaced = true
      req.session.couponApplied = null
      return res.json({successStatus: true})
    }else{
      const order = await orderModel.findOneAndUpdate({_id: req.body.order.receipt}, {
        $set: {
          isCancelled: true
        }
      })
      return res.json({successStatus:false})
    }
  } catch (error) {
    console.log(error)
  }
}

const cancelPayment = async(req, res) => {
  try {
    const order = await orderModel.findOneAndUpdate({_id: req.body.order.receipt}, {
      $set: {
        isCancelled: true,
      }
    })
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const paymentFailure = async(req, res) => {
  console.log('on payment cancelled page')
  console.log(req.body.order)
  try {
    const payment = new paymentModel({
      orderId: req.body.order.receipt,
      customerId: req.session.user._id,
      paymentId: req.body.payment.error.metadata['payment_id'],
      razorpayOrderId: req.body.payment.error.metadata['order_id'],
      status: false
    })
    await payment.save()
    const order = await orderModel.findOneAndUpdate({_id: req.body.order.receipt}, {
      $set: {
        isCancelled: true,
      }
    })
    console.log(order)
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
  }
}


module.exports = {
  getCheckoutPage,
  checkoutCod,
  getOrderPlacedPage,
  addCoupon,
  getFailurePage,
  verifyPayment,
  cancelPayment,
  paymentFailure
}
