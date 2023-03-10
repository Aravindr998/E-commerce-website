const userModel = require('../models/users')
const productModel = require('../models/products')
const mongoose = require('mongoose')

const getCartPage = async(req, res) => {
  try {
    const user = await userModel.findOne({_id: req.session.user._id})
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
      const cart = user.cart
      const {cartTotal} = user
      res.render('users/cart', {cart, cartTotal, user: req.session?.user?.fname})
    }else{
      const cart = []
      const cartTotal = 0
      res.render('users/cart', {cart, cartTotal, user: req.session?.user?.fname})
    }
  } catch (error) {
    console.log(error)
  }
}

const addToCart = async(req, res) => {
  const prodId = req.params.prodid
  const skuid = req.params.skuid
  try {
    const user = await userModel.findById(req.session.user._id)
    const cartItem = {
      productId: prodId,
      skuId: skuid,
      quantity: 1
    }
    let flag = 0
    user.cart.forEach(item => {
      if(skuid == item?.skuId){
        flag = 1
      }
    })
    if(flag == 0){
      await userModel.findOneAndUpdate({_id: req.session.user._id}, {$push: {cart: cartItem}})
    }else{
      await userModel.findOneAndUpdate({_id: req.session.user._id, 'cart.skuId': skuid}, {$inc: {'cart.$.quantity': 1}})
    }
    res.json({
      successStatus: true,
      message: "Item added to cart successfully"
    })
  } catch (error) {
    console.log(error)
    res.json({
      successStatus: false,
      message: "Some error occured. Please try again later"
    })
  }
}

const changeQuantity = async(req, res) => {
  try {
    const product = await productModel.findById(req.body.prodId)
    let total
    const user = await userModel.findById(req.session.user._id)
    let flag = true
    let quantity
    user.cart.forEach(item => {
      if(item.skuId.toString() == req.body.skuId){
        quantity = item.quantity
        if(item.quantity == 1 && req.body.amount<0){
          flag = false
        }
      }
    })
    for(let item of product.skus){
      if(item._id.toString() == req.body.skuId){
        if(item.totalStock-quantity <= 0 && req.body.amount>0){
          return res.json({successStatus: false})
        }
      }
    }
    if(flag){
      await userModel.findOneAndUpdate({_id: req.session.user._id, 'cart.skuId': req.body.skuId}, {
        $inc: {'cart.$.quantity': req.body.amount}
      })
      const cart = await userModel.findById(req.session.user._id)
      .populate('cart.productId')
      cart.cart.forEach((item, index, array) => {
        let temp
        item.productId.skus.forEach( sku => {
          if(sku._id.toString() == item.skuId.toString()){
            temp = sku
          }
        })
        array[index].skus = temp
      })
      const total = cart.cart.reduce((sum, item) => sum += (item.productId.offerPercent ? item.skus[0].price * (1 - item.productId.offerPercent/100) : item.skus[0].price) * item.quantity, 0)
      return res.json({
        successStatus: true,
        quantity: quantity + req.body.amount,
        cartTotal: total
      })
    }else{
      return res.json({
        successStatus: false
      })
    }
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false
    })
  }
}

const removeItem = async(req, res) => {
  try {
    const userCart = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.session.user._id)
        }
      },
      {
        $unwind: '$cart'
      },
      {
        $match: {
          'cart.skuId': mongoose.Types.ObjectId(req.body.skuId)
        }
      },
      {
        $project: {
          'cart.quantity': 1
        }
      }
    ])
    const sku = await productModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.prodId)
        },
      },
      {
        $unwind: '$skus'
      },
      {
        $match: {
          'skus._id': mongoose.Types.ObjectId(req.body.skuId)
        }
      },
      {
        $project: {
          skus: 1
        }
      }
    ])
    const quantity = userCart[0].cart.quantity
    const totalPrice = -sku[0].skus.price*quantity
    await userModel.findOneAndUpdate({_id: req.session.user._id}, {$pull: {cart: {skuId: req.body.skuId}}})
    return res.json({
      successStatus: true
    })
  } catch (error) {
    return res.json({
      successStatus: false
    })
  }
}
const addItemToCart = async(req, res) => {
  const prodId = req.body.prodId
  const skuid = req.body.skuId
  try {
    const user = await userModel.findById(req.session.user._id)
    const cart = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.session.user._id)
        }
      },
      {
        $unwind: '$cart'
      },
      {
        $match: {
          'cart.skuId': mongoose.Types.ObjectId(skuid)
        }
      }
    ])
    const product = await productModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(prodId)
        }
      },
      {
        $unwind: '$skus'
      },
      {
        $match: {
          'skus._id': mongoose.Types.ObjectId(skuid)
        }
      }
    ])
    if(cart.length > 0){
      if(product[0].skus.totalStock - cart[0].cart.quantity <= 0){
        return res.json({successStatus: false, message: 'Item out of stock'})
      }
    }
    const cartItem = {
      productId: prodId,
      skuId: skuid,
      quantity: 1
    }
    let flag = 0
    user.cart.forEach(item => {
      if(skuid == item?.skuId){
        flag = 1
      }
    })
    if(flag == 0){
      await userModel.findOneAndUpdate({_id: req.session.user._id}, {$push: {cart:{ $each: [cartItem], $position: 0}}})
    }else{
      await userModel.findOneAndUpdate({_id: req.session.user._id, 'cart.skuId': skuid}, {$inc: {'cart.$.quantity': 1}})
    }
    res.json({
      successStatus: true,
    })
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

module.exports = {
  getCartPage,
  addToCart,
  changeQuantity,
  removeItem,
  addItemToCart
}