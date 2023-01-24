require('dotenv').config()
const userModel = require('../models/users')
const bcrypt = require('bcrypt')
const fast2sms = require('fast-two-sms')
const axios = require('axios')
const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const bannerModel = require('../models/banners')
const couponModel = require('../models/coupons')
const paymentModel = require('../models/payment')
const mongoose = require('mongoose')
const orderModel = require('../models/orders')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
let otp

const getHomepage = async(req, res) => {
  try {
    const banner = await bannerModel.findOne({setCurrent: true})
    const categories = await categoryModel.find()
    .populate('products')
    categories.forEach(item => {
      item.products.splice(3, Infinity)
      item.products[0]?.skus.forEach((sku, index, array) => {
        if(sku.isDeleted || sku.totalStock<= 0){
          array.splice(index, 1)
        }
      })
    })
      if(req.session.user){
        return res.render('home-page', {categories, banner, user: req.session?.user?.fname})
      }else{
        return res.render('landing-page', {categories, banner})
      }
  } catch (error) {
    console.log(error)
    return res.render('404')
  }
}

const getLogin = (req, res)=> {
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    req.session.Errmessage = null
    return res.render('login', {message})
  }else{
    const message = ""
    return res.render('login', {message})
  }
}

const getRegister = (req, res)=> {
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    const user = req.session.registerUser
    req.session.registerUser = null
    req.session.Errmessage = null
    return res.render('register', {message, user})
  }else{
    const message = ""
    const user = {}
    return res.render('register', {message, user})
  }
}

const authenticate = (req, res, next)=>{
  if(req.session.user){
    next()
  }else{
    return res.redirect('/login')
  }
}

const registerUser = async (req, res, next)=>{
  let existing
  try {
    existing = await userModel.find({$or: [{email: req.body.email}, {phone: req.body.phone}]})
  } catch (error) {
    console.log(error)
  }
  const user = new userModel({
    fname: req.body.fname,
    lname: req.body.lname,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password

  })
  if(existing.length == 0){
    if(req.body['confirm-password'] != req.body.password){
      req.session.Errmessage = "Password do not match"
      req.session.registerUser = user
      return res.json({
        redirect: '/register',
        saveStatus: false
      })
    }else if(!(req.body.phone).match(/^[6789]\d{9}$/)){
      req.session.Errmessage = "Invalid mobile number"
      req.session.registerUser = user
      return res.json({
        redirect: '/register',
        saveStatus: false
      })
    }
    try{
      await user.validate()
      res.json({saveStatus: true})
      next()
    }catch(error){
      console.log(error)
      let message;
      if(error.errors.fname){
        req.session.Errmessage = error.errors.fname.properties.message
      }else if(error.errors.lname){
        req.session.Errmessage = error.errors.lname.properties.message
      }else if(error.errors.email){
        req.session.Errmessage = error.errors.email.properties.message
      }else if(error.errors.phone){
        req.session.Errmessage = error.errors.phone.properties.message
      }else if(error.errors.password){
        req.session.Errmessage = error.errors.password.properties.message
      }
      req.session.registerUser = user
      return res.json({
        saveStatus: false,
        redirect: '/register'
      })
    }
  }else{
    req.session.Errmessage = "User already exists"
    req.session.registerUser = user
    return res.json({
      saveStatus: false,
      redirect: '/register'
    })
  }
}

const loginUser = async (req, res) => {
  try{
    if(req.body.email == "" || req.body.password == ""){
      req.session.Errmessage = "Email and password cannot be empty"
      return res.redirect('/login')
    }
    const user = await userModel.find({email: req.body.email})
    if(user.length == 0){
      req.session.Errmessage = "User does not exist"
      return res.redirect('/login')
    }else{
      try {
        const match = await bcrypt.compare(req.body.password, user[0].password)
        if(!match){
          req.session.Errmessage = "Invalid password"
          return res.redirect('/login')
        }else if(user[0].isBlocked){
            req.session.Errmessage = "Cannot sign in"
            return res.redirect('/login')
          }else{
            req.session.user = user[0]
            res.redirect('/')
          }
      } catch (error) {
        console.log(error)
      }
    }
  }catch(error){
    return res.status(500).send(error)
  }
}

const logoutUser = (req, res) => {
  req.session.user = null
  return res.redirect('/')
}

const checkOtp = async (req, res) => {
  console.log('check otp')
  console.log(otp)
  console.log(req.body.otp)
  if(req.body.otp == otp){
    const user = new userModel({
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password
    })
    try{
      await user.save()
      res.json({
        saveStatus: true,
        redirect: '/login'
      })
    }catch(error){
      console.log(error)
      res.json({
        saveStatus: true,
        redirect: '/register'
      })
    }
  }else{
    res.json({
      message: 'Invalid OTP'
    })
  }
}

const generateOtp = (req, res, next) => {
  console.log('generate otp')
  console.log(req.body.otp)
  if(req.body.otpEntered){
    next()
  }else{
    otp = Math.floor(100000 + Math.random()*900000)
    console.log(otp)
    sendOtp(otp, req.body.phone)
    .then((response)=>{
      console.log(response.data)
      next()
    })
    .catch((error) => {
      console.log(error)
      return res.redirect('/register')
    })
  }
}

const resendOtp = (req, res, next) => {
  otp = Math.floor(100000 + Math.random()*900000)
  sendOtp(otp, req.body.phone)
  .then((response)=>{
    console.log(response.data)
    if(response.data.return){
      return res.json({message: "OTP sent successfully"})
    }else{
      return res.json({message: "Some error occured"})
    }
  })
  .catch((error) => {
    console.log(error)
    return res.json({message: "Could not resend, Please try again"})
  })
}

const getProductsPage = async(req, res) => {
  try {
    let searchKey
    let products
    if(req.session.searchKey){
      searchKey = req.session.searchKey
      req.session.searchKey = null
      products = await productModel.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryId'
          }
        },
        {
          $unwind: '$categoryId'
        },
        {
          $unwind: '$skus'
        },
        {
          $match: {
            'skus.isDeleted': false,
            'skus.totalStock': {$gt: 0}
          }
        },
        {
          $match: {
            $or: [
              {title: new RegExp(searchKey, 'i')},
              {'skus.color': new RegExp(searchKey, 'i')},
              {'categoryId.categoryName': new RegExp(searchKey, 'i')}
            ]
          }
        }
      ])
    }else{
      products = await productModel.aggregate([
        {
          $unwind: '$skus'
        },
        {
          $match: {
            'skus.isDeleted': false,
            'skus.totalStock': {$gt: 0}
          }
        },
        {
          $sort: {
            categoryId: 1
          }
        }
      ])
    }
    const categories = await categoryModel.find()
    const categoryArray = []
    categories.forEach(item => {
      categoryArray.push(item._id)
    })
    let from = req.session.from || 0
    let to = req.session.to || 1000000
    let category = []
    if(req.session.category){
      req.session.category.forEach(item => {
        category.push(mongoose.Types.ObjectId(item))
      })
    }else{
      category = categoryArray
    }
    console.log(from, to, category)
    console.log(req.session.from, req.session.to, req.session.category)
    if(req.session.from || req.session.to || req.session.category){
      console.log('entered')
      req.session.from = null
      req.session.to = null
      req.session.category = null
      products = await productModel.aggregate([
        {
          $unwind: '$skus'
        },
        {
          $match: {
            'skus.isDeleted': false,
            'skus.totalStock': {$gt: 0},
            $and:[
              {'skus.price': {$gte: parseInt(from)}},
              {'skus.price': {$lte: parseInt(to)}},
            ],
            categoryId: {$in : category}
          }
        },
        {
          $sort: {
            categoryId: 1
          }
        }
      ])
    }
    res.render('users/product-page', {products, categories, user: req.session?.user?.fname})
  } catch (error) {
   console.log(error) 
  }
}

const getDetailsPage = async(req, res) => {
  try {
    const prodId = req.params.prodid
    const skuId = req.params.skuid
    const product = await productModel.findById(prodId)
    .populate('categoryId')
    product.skus.forEach((item, index, array) => {
      if(item.isDeleted || item.totalStock<=0){
        array.splice(index,1)
      }
    })
    let sku
    product.skus.forEach(item => {
      if(item._id == skuId){
        sku = item
      }
    })
    res.render('users/product-details', {product, sku, user: req.session?.user?.fname})
  } catch (error) {
    
  }
}

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
    const product = await productModel.findById(prodId)
    let sku
    let total;
    product.skus.forEach(item => {
      if(item._id == skuid){
        total= item.price
      }
    })
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
      await userModel.findOneAndUpdate({_id: req.session.user._id}, {$inc: {cartTotal: total}})
    }else{
      await userModel.findOneAndUpdate({_id: req.session.user._id, 'cart.skuId': skuid}, {$inc: {'cart.$.quantity': 1, cartTotal: total}})
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
    product.skus.forEach(item => {
      if(item._id == req.body.skuId){
        total= item.price*req.body.amount
      }
    })
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
          console.log('entered')
          return res.json({successStatus: false})
        }
      }
    }
    if(flag){
      await userModel.findOneAndUpdate({_id: req.session.user._id, 'cart.skuId': req.body.skuId}, {
        $inc: {'cart.$.quantity': req.body.amount, cartTotal: total}
      })
      return res.json({
        successStatus: true,
        quantity: quantity + req.body.amount,
        cartTotal: user.cartTotal + total
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
    await userModel.findOneAndUpdate({_id: req.session.user._id}, {$inc: {cartTotal: totalPrice}})
    return res.json({
      successStatus: true
    })
  } catch (error) {
    return res.json({
      successStatus: false
    })
  }
}

const getWishlishPage = async(req, res) => {
  const user = await userModel.find({_id: req.session.user._id}, {wishlist: 1})
  .populate('wishlist.productId')
  const wishlist = user[0].wishlist
  let wishlistClone = JSON.parse(JSON.stringify(wishlist))
  wishlistClone.forEach((item, index, array) => {
    let temp
    item.productId.skus.forEach( sku => {
      if(sku._id.toString() == item.skuId.toString()){
        temp = sku
      }
    })
    array[index].skus = temp
  })

  res.render('users/wishlist', {wishlist: wishlistClone, user: req.session?.user?.fname})
}

const addToWishlist = async(req, res, next) => {
  const wishlist = {
    productId: req.body.prodId,
    skuId: req.body.skuId
  }
  try {
    let flag = true
    const user = await userModel.findById({_id: req.session.user._id})
    user.wishlist.forEach(item => {
      if(item.skuId == req.body.skuId){
        flag = false
      }
    })
    if(flag){
      await userModel.findOneAndUpdate({_id: req.session.user._id}, {$push: {wishlist: wishlist}})
    }
    next()
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false
    })
  }
}

const deleteFromWishlist = async(req, res, next) => {
  try {
    await userModel.findOneAndUpdate({_id: req.session.user._id}, {$pull: {wishlist: {skuId: req.body.skuId}}})
    next()
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false
    })
  }
}

const sendResponse = (req, res) => {
  return res.json({
    successStatus: true
  })
}

const getDashboard = async(req, res) => {
  const user = await userModel.findById(req.session.user._id)
  return res.render('users/dashboard', {userDetails: user, user: req.session?.user?.fname})
}

const getDashboardEdit = async(req, res) => {
  const user = await userModel.findById(req.session.user._id)
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    req.session.Errmessage = null
    return res.render('users/dashboard-edit', {userDetails: user, message, user: req.session?.user?.fname})
  }else{
    const message = ''
    return res.render('users/dashboard-edit', {userDetails: user, message, user: req.session?.user?.fname})
  }
}

const editUser = async(req, res, next) => {
  const user = new userModel({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
    password: '1234'
  })
  try {
    await user.validate()
    res.json({saveStatus: true})
    next()
    
  } catch (error) {
    console.log(error)
    if(error.errors.fname){
      req.session.Errmessage = error.errors.fname.properties.message
    }else if(error.errors.lname){
      req.session.Errmessage = error.errors.lname.properties.message
    }else if(error.errors.email){
      req.session.Errmessage = error.errors.email.properties.message
    }else if(error.errors.phone){
      req.session.Errmessage = error.errors.phone.properties.message
    }else if(error.errors.password){
      req.session.Errmessage = error.errors.password.properties.message
    }
    return res.json({
      saveStatus: false
    })
  }
}

const updateUser = async(req, res) => {
  if(otp == req.body.otp){
    try {
      await userModel.findOneAndUpdate({
        _id: req.session.user._id
      },
      {
        $set: {
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          phone: req.body.phone
        }
      })
      res.json({saveStatus: true})
    } catch (error) {
      console.log(error)
      res.json({saveStatus: false})
    }
  }else{
    res.json({message:'Invalid OTP'})
  }
}

const getAddAddress = (req, res) => {
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    const address = req.session.address
    req.session.Errmessage = null
    req.session.address = null
    res.render('users/add-address', {message, address, user: req.session?.user?.fname})
  }else{
    const message = ''
    const address = {}
    res.render('users/add-address', {message, address, user: req.session?.user?.fname})
  }
}

const saveAddress = async(req, res) => {
  const address = {
    street1: req.body.street1,
    street2: req.body.street2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip
  }
  try {
    await userModel.findOneAndUpdate({
      _id: req.session.user._id
    }, {
      $push: {
        shippingAddress: address
      }
    })
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
    res.redirect('/dashboard')
  }
}

const getEditAddressPage = async(req, res) => {
  try {
    const address = await userModel.aggregate([
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
          'shippingAddress._id': mongoose.Types.ObjectId(req.params.id)
        }
      },
      {
        $project: {
          shippingAddress: 1
        }
      }
    ])
    if(req.session.Errmessage){
      const message = req.session.Errmessage
      req.session.Errmessage = null
      res.render('users/edit-address', {address: address[0].shippingAddress, message, user: req.session?.user?.fname})
    }else{
      const message = ''
      res.render('users/edit-address', {address: address[0].shippingAddress, message, user: req.session?.user?.fname})
    }
  } catch (error) {
    console.log(error)
  }
}

const updateAddress = async(req, res) => {
  try {
    await userModel.findOneAndUpdate({
      shippingAddress: {
        $elemMatch: {
          _id: mongoose.Types.ObjectId(req.params.id)
        }
      }
    }, 
    {
      $set: {
        'shippingAddress.$.street1': req.body.street1,
        'shippingAddress.$.street2': req.body.street2,
        'shippingAddress.$.city': req.body.city,
        'shippingAddress.$.state': req.body.state,
        'shippingAddress.$.zip': req.body.zip,
      }
    })
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
}

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
        cart: [],
        cartTotal: 0
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

function sendOtp(otp, number){
  console.log('sendotp')
  console.log(otp)
  const body = {
    "authorization" : process.env.AUTHORIZATION_KEY,
    "variables_values" : otp,
    "route" : "otp",
    "numbers" : number
  }
  return axios({
    method : 'GET',
    url : "https://www.fast2sms.com/dev/bulkV2",
    data: body
  })
}

const addCoupon = async(req, res) => {
  try {
    const coupon = await couponModel.findById(req.body.id)
    console.log(coupon)
    const user = await userModel.findById(req.session.user._id)
    let discount;
    if(coupon.users.includes(req.session.user._id)){
      return res.json({
        successStatus: false,
        message: 'You have already availed this offer'
      })
    }
    if(coupon.minPurchaseValue){
      if(user.cartTotal < coupon.minPurchaseValue){
        return res.json({
          successStatus: false,
          message: `Please add items worth Rs. ${coupon.minPurchaseValue - user.cartTotal} more to avail this offer`
        })
      } 
      if(coupon.isPercentage){
        discount = user.cartTotal * coupon.discount/100
      }else{
        discount = coupon.discount
      }
      req.session.couponApplied = {
        discount,
        couponId: coupon._id,
        couponCode: coupon.code
      }
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
          cartTotal: 0
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
          'items.$[].isCancelled': true
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
        'items.$[].isCancelled': true,
      }
    })
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const paymentFailure = async(req, res) => {
  try {
    const payment = new paymentModel({
      orderId: req.body.order.receipt,
      customerId: req.session.user._id,
      paymentId: req.body.payment['razorpay_payment_id'],
      razorpayOrderId: req.body.payment['razorpay_order_id'],
      paymentSignature: req.body.payment['razorpay_signature'],
      status: false
    })
    await payment.save()
    const order = await orderModel.findOneAndUpdate({_id: req.body.order.receipt}, {
      $set: {
        'items.$[].isCancelled': true,
      }
    })
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
  }
}

const addItemToCart = async(req, res) => {
    const prodId = req.body.prodId
    const skuid = req.body.skuId
    try {
      const user = await userModel.findById(req.session.user._id)
      const product = await productModel.findById(prodId)
      let sku
      let total;
      product.skus.forEach(item => {
        if(item._id == skuid){
          total= item.price
        }
      })
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
      console.log(total)
      if(flag == 0){
        console.log()
        await userModel.findOneAndUpdate({_id: req.session.user._id}, {$push: {cart:{ $each: [cartItem], $position: 0}}})
        await userModel.findOneAndUpdate({_id: req.session.user._id}, {$inc: {cartTotal: total}})
      }else{
        console.log(flag)
        await userModel.findOneAndUpdate({_id: req.session.user._id, 'cart.skuId': skuid}, {$inc: {'cart.$.quantity': 1, cartTotal: total}})
      }
      res.json({
        successStatus: true,
      })
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const searchProducts = async(req, res) => {
  const noSpecialChars = req.query.search.replace(/[^a-zA-Z0-9 ]/g, '')
  req.session.searchKey = noSpecialChars
  res.redirect('/products')
}

const filterProducts = (req, res) => {
  req.session.from = req.query.from
  req.session.to = req.query.to
  req.session.category = req.query.category
  res.redirect('/products')
}

const getForgotPasswordPage = (req, res) => {
  let message = ""
  if(req.session.Errmessage){
    message = req.session.Errmessage
    req.session.Errmessage = null
  }
  res.render('users/forgot-password-mail', {message})
}

const checkUser = async(req, res) => {
  if(!req.body.email){
    req.session.Errmessage = 'Email cannot be empty'
    return res.redirect('/forgot-password')
  }else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)){
    req.session.Errmessage = 'Invalid email'
    return res.redirect('/forgot-password')
  }else{
    const user = await userModel.find({email: req.body.email})
    if(user.length == 0){
      req.session.Errmessage = 'User does not exist. Please sign up'
      return res.redirect('/forgot-password')
    }else{
      const otp = generateMailOtp()
      req.session.emailOtp = otp
      console.log(otp)
      try {
        const info = await sendMail(user[0].email, otp)
      } catch (error) {
        console.log(error)
        req.session.Errmessage = 'Some error occured. Please try again later'
        return res.redirect('/forgot-password')
      }
      return res.redirect(`/forgot-password/${user[0]._id}`)
    }
  }
}

const getEnterOtpPage = async(req, res) => {
  try {
    if(req.session.emailOtp){
      let message = ''
      if(req.session.Errmessage){
        message = req.session.Errmessage
        req.session.Errmessage = null
      }
      const user = await userModel.findById(req.params.id)
      res.render('users/enter-mail-otp', {message, user})
    }else{
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

const checkMailOtp = async(req, res) => {
  try {
    if(req.session.emailOtp){
      if(req.body.otp == req.session.emailOtp){
        res.redirect(`/password/reset/${req.params.id}`)
      }else{
        req.session.Errmessage = 'Invalid OTP'
        res.redirect(`/forgot-password/${req.params.id}`)
      }
    }else{
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

const getResetPasswordPage = async(req, res) => {
  try {
    if(req.session.emailOtp){
      const user = await userModel.findById(req.params.id)
      let message = ''
      if(req.session.Errmessage){
        message = req.session.Errmessage
        req.session.Errmessage = null
      }
      res.render('users/reset-password', {message, user})
    }else{
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

const resetPassword = async(req, res) => {
  try {
    if(req.body.password != req.body['confirm-password']){
      req.session.Errmessage = 'Passwords do not match'
      res.redirect(`/password/reset/${req.params.id}`)
    }else{
      const user = await userModel.findById(req.params.id)
      user.password = req.body.password
      await user.save()
      req.session.emailOtp = null
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

const downloadInvoice = async(req, res) => {
  res.download(`./public/invoice/${req.params.id}.pdf`, 'Invoice.pdf')
}

function generateMailOtp(){
  return Math.floor(100000 + Math.random()*900000)
}

function sendMail(mail, otp){
  return new Promise(async(resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    })
    let detail = {
      from: process.env.NODEMAILER_EMAIL,
      to: mail,
      subject: 'KROMA OTP',
      text: `Your OTP for resetting password is ${otp}`
    }
    try {
      let info = await transporter.sendMail(detail)
      console.log("Message sent: %s", info.messageId)
      resolve(info)
    } catch (error) {
      reject(error)
    }
    
  })
}

const temp = async(req, res) => {
  
  res.render('users/tax-invoice', {user, order})
}

module.exports = {
  getHomepage,
  getLogin,
  getRegister,
  authenticate,
  registerUser,
  loginUser,
  logoutUser,
  checkOtp,
  generateOtp,
  resendOtp,
  getProductsPage,
  getDetailsPage,
  getCartPage,
  addToCart,
  changeQuantity,
  removeItem,
  getWishlishPage,
  addToWishlist,
  deleteFromWishlist,
  sendResponse,
  getDashboard,
  getDashboardEdit,
  editUser,
  updateUser,
  getAddAddress,
  saveAddress,
  getEditAddressPage,
  updateAddress,
  getCheckoutPage,
  checkoutCod,
  getOrderPlacedPage,
  getOrdersPage,
  getOrderDetails,
  cancelOrder,
  addCoupon,
  getFailurePage,
  createOrder,
  verifyPayment,
  cancelPayment,
  paymentFailure,
  addItemToCart,
  searchProducts,
  filterProducts,
  getForgotPasswordPage,
  checkUser,
  getEnterOtpPage,
  checkMailOtp,
  getResetPasswordPage,
  resetPassword,
  downloadInvoice,
  temp
}