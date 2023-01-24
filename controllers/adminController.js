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

const getHomepage = async (req, res) => {
  try {
    const product = await productModel.find().populate('categoryId')
    res.render('admin/admin-dashboard', {product})
  } catch (error) {
    console.log(error)
  }
}

const redirectHomepage = async(req, res) => {
  return res.redirect('/admin')
}

const getAddProducts = async (req, res) => {
  try { 
    const categories = await categoryModel.find()
    if(req.session.Errmessage){
      const message = req.session.Errmessage
      const product = req.session.addProducts
      console.log(product)
      let skus ={}
      product.skus.forEach(item => {
        skus = item
      })
      req.session.Errmessage = null
      req.session.product = null
      return res.render('admin/add-products', {categories, message, product, skus})
    }else{
      const message = ""
      const product = {}
      const skus = {}
      return res.render('admin/add-products', {categories, message, product, skus})
    }
  } catch (error) {
    console.log(error)
  }
}

const addProducts = async(req, res) => {
  try {    
    const existing = await productModel.find({title: req.body.title})
    const images = []
    console.log(req.files)
    for(key in req.files){
      const paths = req.files[key][0].path
      images.push(paths.slice(7))
    }
      console.log(images)
      const product = new productModel({
        title: req.body.title,
        warranty: req.body.warranty,
        categoryId: req.body.category,
        'skus.0.color': req.body.color,
        'skus.0.highlights': req.body.highlights,
        'skus.0.dimension': req.body.dimension,
        'skus.0.price': req.body.price,
        'skus.0.totalStock': req.body.stock,
        'skus.0.price': req.body.price,
        'skus.0.images': images
      })
    if(existing.length == 0){
      if(images.length != 3){
        req.session.Errmessage = "Image cannot be empty"
        req.session.addProducts = product
        return res.redirect('/admin/products/new')
      }
      try{
        await product.save()
        return res.redirect('/admin/products')
      }catch(error){
        console.log(error)
        if(error.errors.title){
          req.session.Errmessage = error.errors.title.properties.message
        }else if(error.errors.warranty){
          req.session.Errmessage = error.errors.warranty.properties.message
        }else if(error.errors.categoryId){
          req.session.Errmessage = error.errors.categoryId.properties.message
        }else if(error.errors['skus.0.color']){
          req.session.Errmessage = error.errors['skus.0.color'].properties.message
        }else if(error.errors['skus.0.highlights']){
          req.session.Errmessage = error.errors['skus.0.highlights'].properties.message
        }else if(error.errors['skus.0.dimension']){
          req.session.Errmessage = error.errors['skus.0.dimension'].properties.message
        }else if(error.errors['skus.0.price']){
          req.session.Errmessage = error.errors['skus.0.price'].properties.message
        }else if(error.errors['skus.0.totalStock']){
          req.session.Errmessage = error.errors['skus.0.totalStock'].properties.message
        }
        req.session.addProducts = product
        return res.redirect('/admin/products/new')
      }
    }else{
      req.session.Errmessage = "Product already exists"
      req.session.addProducts = product
      return res.redirect('/admin/products/new')
    }
  } catch (error) {
    console.log(error)
  }
}

const newSku = async (req, res) => {
  try {     
    if(req.session.addProducts || req.session.update){
      const categories = await categoryModel.find()
      const product = req.session.addProducts
      const skus = req.session.skus || {}
      const message = req.session.Errmessage || ""
      req.session.addProducts = null
      req.session.Errmessage = null
      req.session.skus = null
      req.session.update = null
      return res.render('admin/new-sku', {product, skus, categories, message})
    }else{
      return res.redirect('/admin/products')
    }
  } catch (error) {
    console.log(error)
  }
}

const addNewSku = async (req, res) => {
  try {     
    console.log('in add new sku')
    const existing = await productModel.find({title: req.body.title})
    const images = []
    for(key in req.files){
      const paths = req.files[key][0].path
      images.push(paths.slice(7))
    }
      console.log(images)
      const product = new productModel({
        title: req.body.title,
        warranty: req.body.warranty,
        categoryId: req.body.category,
        'skus.0.color': req.body.color,
        'skus.0.highlights': req.body.highlights,
        'skus.0.dimension': req.body.dimension,
        'skus.0.price': req.body.price,
        'skus.0.totalStock': req.body.stock,
        'skus.0.price': req.body.price,
        'skus.0.images': images
      })
    if(existing.length == 0){
      if(images.length != 3){
        req.session.Errmessage = "Image cannot be empty"
        req.session.addProducts = product
        return res.redirect('/admin/products/new')
      }
      try{
        await product.save()
        req.session.addProducts = product
        return res.redirect('/admin/products/new/skus')
      }catch(error){
        console.log(error)
        if(error.errors.title){
          req.session.Errmessage = error.errors.title.properties.message
        }else if(error.errors.warranty){
          req.session.Errmessage = error.errors.warranty.properties.message
        }else if(error.errors.categoryId){
          req.session.Errmessage = error.errors.categoryId.properties.message
        }else if(error.errors['skus.0.color']){
          req.session.Errmessage = error.errors['skus.0.color'].properties.message
        }else if(error.errors['skus.0.highlights']){
          req.session.Errmessage = error.errors['skus.0.highlights'].properties.message
        }else if(error.errors['skus.0.dimension']){
          req.session.Errmessage = error.errors['skus.0.dimension'].properties.message
        }else if(error.errors['skus.0.price']){
          req.session.Errmessage = error.errors['skus.0.price'].properties.message
        }else if(error.errors['skus.0.totalStock']){
          req.session.Errmessage = error.errors['skus.0.totalStock'].properties.message
        }
        req.session.addProducts = product
        return res.redirect('/admin/products/new')
      }
    }else{
      req.session.Errmessage = "Product already exists"
      req.session.addProducts = product
      return res.redirect('/admin/products/new')
    }
  } catch (error) {
    console.log(error)
  }
}

const saveSku = async(req, res, next) => {
  try {
    const product = await productModel.findOne({title: req.body.title})
    console.log(product)
    console.log(req.body.title)
    const images = []
    for(key in req.files){
      const paths = req.files[key][0].path
      images.push(paths.slice(7))
    }
    const skus = {
      color: req.body.color,
      price: req.body.price,
      totalStock: req.body.stock,
      highlights: req.body.highlights,
      dimension: req.body.dimension,
      images
    }
    let repeat = false
    product.skus.forEach(item => {
      if(item.color == req.body.color){
        repeat = true
      }
    })
    if(repeat){
      req.session.Errmessage = "Sku already exists"
      req.session.addProducts = product
      req.session.skus = skus
      return res.redirect('/admin/products/new/skus')
    }
    if(images.length != 3){
      req.session.Errmessage = 'Images cannot be empty'
      req.session.addProducts = product
      req.session.skus = skus
      return res.redirect('/admin/products/new/skus')
    }
    try {
      await productModel.findOneAndUpdate({title: req.body.title}, {
        $push: {
          skus: skus
        }
      }, {runValidators: true})
      req.session.update = true
      return res.redirect('/admin/products')
    } catch (error) {
      console.log(error)
      req.session.Errmessage = "Some error occured"
        const length = skus.length
        if(error.errors['skus.color']){
          req.session.Errmessage = error.errors['skus.color'].properties.message
        }else if(error.errors['skus.highlights']){
          req.session.Errmessage = error.errors['skus.highlights'].properties.message
        }else if(error.errors['skus.dimension']){
          req.session.Errmessage = error.errors['skus.dimension'].properties.message
        }else if(error.errors['skus.price']){
          req.session.Errmessage = error.errors['skus.price'].properties.message
        }else if(error.errors['skus.totalStock']){
          req.session.Errmessage = error.errors['skus.totalStock'].properties.message
        }
        req.session.addProducts = product
        req.session.skus = skus
        return res.redirect('/admin/products/new/skus')
    }
  } catch (error) {
    console.log(error)
  }
  
}

const saveSku2 = async(req, res, next) => {
  try {
    const product = await productModel.findOne({title: req.body.title})
    console.log(product)
    console.log(req.body.title)
    const images = []
    for(key in req.files){
      const paths = req.files[key][0].path
      images.push(paths.slice(7))
    }
    const skus = {
      color: req.body.color,
      price: req.body.price,
      totalStock: req.body.stock,
      highlights: req.body.highlights,
      dimension: req.body.dimension,
      images
    }
    let repeat = false
    product.skus.forEach(item => {
      if(item.color == req.body.color){
        repeat = true
      }
    })
    if(repeat){
      req.session.Errmessage = "Sku already exists"
      req.session.addProducts = product
      req.session.skus = skus
      return res.redirect('/admin/products/new/skus')
    }
    if(images.length != 3){
      req.session.Errmessage = 'Images cannot be empty'
      req.session.addProducts = product
      req.session.skus = skus
      return res.redirect('/admin/products/new/skus')
    }
    try {
      await productModel.findOneAndUpdate({title: req.body.title}, {
        $push: {
          skus: skus
        }
      }, {runValidators: true})
      req.session.addProducts = product
      return res.redirect('/admin/products/new/skus')
    } catch (error) {
      console.log(error)
      req.session.Errmessage = "Some error occured"
        const length = skus.length
        if(error.errors['skus.color']){
          req.session.Errmessage = error.errors['skus.color'].properties.message
        }else if(error.errors['skus.highlights']){
          req.session.Errmessage = error.errors['skus.highlights'].properties.message
        }else if(error.errors['skus.dimension']){
          req.session.Errmessage = error.errors['skus.dimension'].properties.message
        }else if(error.errors['skus.price']){
          req.session.Errmessage = error.errors['skus.price'].properties.message
        }else if(error.errors['skus.totalStock']){
          req.session.Errmessage = error.errors['skus.totalStock'].properties.message
        }
        req.session.addProducts = product
        req.session.skus = skus
        return res.redirect('/admin/products/new/skus')
    }
  } catch (error) {
    console.log(error)
  }
  
}

const getDetailsPage = async(req, res) => {
  try {
    const id = req.params.id
    const product = await productModel.findById({_id: id})
    .populate('categoryId')
    console.log(product)
    if(product?.title){
      product.skus.forEach((item, index, array)=> {
        if(item.isDeleted == true){
          array.splice(index, 1)
        }
      })
      const categories = await categoryModel.find()
      return res.render('admin/product-details', {product, categories})
    }else{
      return res.redirect('/admin/products')
    }
  } catch (error) {
    console.log(error)
  }
}

const getEditPage = async(req, res) => {
  try {
    const id = req.params.id
    const product = await productModel.findById({_id: id})
    const categories = await categoryModel.find()
    return res.render('admin/product-edit', {product, categories})
  } catch (error) {
    console.log(error)
  }
}

const updateProduct = async (req, res) => {
  const id = req.params.id
  try {
    await productModel.findOneAndUpdate({_id: id}, {
      title: req.body.title,
      warranty: req.body.warranty,
      categoryId: req.body.category
    }, {runValidators: true})
    console.log('product updated')
    return res.json({
      successStatus: true,
      redirect: '/admin/products/view/'+id
    })
  } catch (error) {
    let message
    if(error.errors.title){
      message = error.errors.title.properties.message
    }else if(error.errors.warranty){
      message = error.errors.warranty.properties.message
    }else if(error.errors.categoryId){
      message = error.errors.categoryId.properties.message
    }
    return res.json({
      successStatus: false,
      message,
    })
  }
}

const getSkuEditPage = async (req, res) => {
  try {
    const prodId = req.params.prodid
    const skuId = req.params.skuid
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
          'skus._id': mongoose.Types.ObjectId(skuId)
        }
      },
      {
        $project: {
          skus: 1
        }
      }
    ])
    const skus = product[0].skus
    res.render('admin/product-skus-edit', {skus})
  } catch (error) {
    console.log(error)
  }
}

const updateProductSku = async (req, res) => {
  try {
    const id = req.params.id
    const product = await productModel.aggregate([
      {
        $match: {
          skus: {
            $elemMatch: {
              _id: mongoose.Types.ObjectId(id)
            }
          }
        }
      },
      {
        $unwind: '$skus'
      },
      {
        $match: {
          'skus._id': mongoose.Types.ObjectId(id)
        }
      },
      {
        $project: {
          skus: 1
        }
      }
    ])
    const skus = product[0].skus
    const images = skus.images
    if(req.files.image1){
      const paths = req.files.image1[0].path
      const deleted = images.splice(0,1,paths.slice(7))
      await unlinkAsync('./public/'+deleted)
    }
    if(req.files.image2){
      const paths = req.files.image2[0].path
      const deleted = images.splice(1,1,paths.slice(7))
      await unlinkAsync('./public/'+deleted)
    }
    if(req.files.image3){
      const paths = req.files.image3[0].path
      const deleted = images.splice(2,1,paths.slice(7))
      await unlinkAsync('./public/'+deleted)
    }
    if(images.length != 3){
      return res.json({
        successStatus: false,
        message: "Image cannot be empty"
      })
    }
    try {
      await productModel.findOneAndUpdate({skus: {$elemMatch: {_id: id}}}, {
        $set: {
          'skus.$.color': req.body.color,
          'skus.$.price': req.body.price,
          'skus.$.highlights': req.body.highlights,
          'skus.$.dimension': req.body.dimension,
          'skus.$.totalStock': req.body.stock,
          'skus.$.images': images
        }
      }, {runValidators: true})
      return res.json({
        successStatus: true,
        redirect: '/admin/products'
      })
    } catch (error) {
      console.log(error)
        return res.json({
          successStatus: false,
          message: "Field cannot be empty"
        })
    }
  } catch (error) {
    console.log(error)
  }
}

const getAddSkusPage = async (req, res) => {
  try {
    const id = req.params.id
    const products = await productModel.find({_id: id})
    const categories = await categoryModel.find()
    const product = products[0]
    const message = ""
    const skus = {}
    console.log(product)
    res.render('admin/new-sku', {product, categories, skus, message})
  } catch (error) {
    console.log(error)
  }
}

const deleteProduct = async (req, res) => {
  const id = req.params.id
  try {
    await productModel.findOneAndUpdate({_id: id}, {$set: {isDeleted: true, "skus.$[].isDeleted": true}})
    return res.json({
      successStatus: true,
      redirect: '/admin/products'
    })
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false,
      message: 'Some error occured, please try again later'
    })
  }
}

const deleteSku = async (req, res) => {
  const id = req.params.skuId
  const prodId = req.params.prodId
  try {
    let count = 0
    const product = await productModel.findById(prodId)
    product.skus.forEach(item => {
      if(item.isDeleted == false){
        count++
      }
    })
    if(count == 1){
      product.isDeleted = true
      product.skus.forEach(item => item.isDeleted = true)
      await product.save()
      return res.json({
        successStatus: true,
        redirect: '/admin/products'
      })
    }else{
      const result = await productModel.findOneAndUpdate({skus: {$elemMatch: {_id: id}}}, {
        $set: {
          'skus.$.isDeleted': true,
        }
      })
      return res.json({
        successStatus: true,
        redirect: '/admin/products'
      })
    }
  }catch (error) {
    console.log(error)
    return res.json({
      successStatus: false,
      message: 'Some error occured please try again later'
    })
  }
}

//user management

const getUserList = async(req, res)=> {
  try {
    const users = await userModel.find().sort({fname: 1})
    res.render('admin/user/user-list', {users})
  } catch (error) {
    console.log(error)
  }
}

const getUserDetails = async(req, res) => {
  try {
    id = req.params.id
    const user = await userModel.findById(id)
    res.render('admin/user/user-details', {user})
  } catch (error) {
    console.log(error)
  }
}

const blockUser = async(req, res) => {
  try {
    const id = req.params.id
    const user = await userModel.findById(id)
    if(user.isBlocked){
      try {
        await userModel.findOneAndUpdate({_id:id}, {
          $set: {
            isBlocked: false
          }
        })
        return res.json({
          successStatus: true,
          redirect: '/admin/users/view/'+id
        })
      } catch (error) {
        console.log(error)
        return res.json({
          successStatus: false
        })
      }
    }else{
      try {
        await userModel.findOneAndUpdate({_id:id}, {
          $set: {
            isBlocked: true
          }
        })
        return res.json({
          successStatus: true,
          redirect: '/admin/users/view/'+id
        })
      } catch (error) {
        console.log(error)
        return res.json({
          successStatus: false
        })
      }
    }
  } catch (error) {
    console.log(error)
  }
  
}

const logoutAdmin = (req, res) => {
  req.session.admin = null
  res.redirect('/admin')
}

//category management

const getCategoriesPage = async(req, res) => {
  try {
    const categories = await categoryModel.find()
    if(req.session.Errmessage){
      const message = req.session.Errmessage
      req.session.Errmessage = null
      res.render('admin/categories/categories', {categories, message})
    }else{
      const message = ''
      res.render('admin/categories/categories', {categories, message})
    }
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

const addNewCategory = async(req, res) => {
  const category = new categoryModel({
    categoryName: req.body.category
  })
  try {
    const existing = await categoryModel.find({categoryName: new RegExp(req.body.category, 'i')})
    if(existing.length>0){
      req.session.Errmessage = 'Category already exists'
      return res.redirect('/admin/categories')
    }
    await category.save()
    res.redirect('/admin/categories')
  } catch (error) {
    req.session.Errmessage = error.errors.categoryName.properties.message
    res.redirect('/admin/categories')
  }
}

const deleteCategory = async(req, res) => {
  try {
    await categoryModel.findOneAndUpdate({_id: req.params.id}, {$set: {isDeleted: true}})
    await productModel.updateMany({categoryId: mongoose.Types.ObjectId(req.params.id)}, {$set: {isDeleted: true}})
    return res.json({
      successStatus: true,
      redirect: '/admin/categories'
    })
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false,
      message: 'Error'
    })
  }
}

//banner management

const getBannersPage = async(req, res) => {
  try {
    const banners = await bannerModel.find()
    let message = ''
    if(req.session.Errmessage){
      message = req.session.Errmessage
      req.session.Errmessage = null
    }
    res.render('admin/banners/banners', {banners, message})
  } catch (error) {
    console.log(error)
  }
}

const saveBanner = async(req, res) => {
  try {
    if(!req.body.name){
      req.session.Errmessage = 'Name cannot be empty'
      return res.redirect('/admin/banner')
    }else if(!req.file){
      req.session.Errmessage = 'Image file is required'
      return res.redirect('/admin/banner')
    }
    const paths = req.file.path.slice(7).replace(new RegExp('\\' + path.sep, 'g'), '/')
    console.log(paths)
    const banner = new bannerModel({
      name: req.body.name,
      caption: req.body.caption,
      image: paths
    })
    await banner.save()
    res.redirect('/admin/banner')
  } catch (error) {
    console.log(error)
  }
}

const setCurrentBanner = async(req, res) => {
  try {
    await bannerModel.updateMany({setCurrent: true}, {$set: {setCurrent: false}})
    await bannerModel.findOneAndUpdate({_id: req.body.bannerId}, {$set: {setCurrent: true}})
    console.log('done')
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const deleteBanner = async(req, res) => {
  try {
    await bannerModel.findOneAndUpdate({_id: req.params.id}, {$set: {isDeleted: true}})
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

//order management

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

const getCouponPage = async(req, res) => {
  try {
    let message = ""
    let autofill = {}
    if(req.session.Errmessage){
      message = req.session.Errmessage
      req.session.Errmessage = null
      autofill = req.session.coupon
    }
    const coupons = await couponModel.find()
    res.render('admin/coupons/coupons', {coupons, message, autofill})
  } catch (error) {
    console.log(error)
  }
}

const addCoupon = async(req, res) => {
  const expiry = new Date(req.body.expiry+'T23:59:59')
  const coupon = new couponModel({
    code: req.body.code,
    description: req.body.description,
    discount: req.body.discount,
    minPurchaseValue: req.body.minPurchaseValue,
    expiry: expiry
  })
  if(req.body.isPercentage){
    coupon.isPercentage = true
  }
  try {
    const existing = await couponModel.find({code: req.body.code})
    if(existing.length>0){
      req.session.Errmessage = 'Coupon code already exists'
      return res.redirect('/admin/coupons')
    }
    await coupon.save()
    res.redirect('/admin/coupons')
  } catch (error) {
    if(error.errors.code){
      req.session.Errmessage = error.errors.code.properties.message
    }else if(error.errors.minPurchaseValue){
      req.session.Errmessage = error.errors.minPurchaseValue.properties.message
    }else if(error.errors.description){
      req.session.Errmessage = error.errors.description.properties.message
    }else if(error.errors.discount){
      req.session.Errmessage = error.errors.discount.properties.message
    }else if(error.errors.expiry){
      req.session.Errmessage = error.errors.expiry.properties.message
    }
    req.session.coupon = coupon
    res.redirect('/admin/coupons')
  }
}

const deleteCoupon = async(req, res) => {
  try {
    await couponModel.findOneAndUpdate({_id: req.body.id}, {$set: { isDeleted: true }})
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const getDashboard = async(req, res) => {
  try {
    const orders = await orderModel.aggregate([
      {
        $unwind: '$items' 
      },
      {
        $match: {
          'items.isCancelled': false,
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
          'items.isCancelled': false,
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
          'items.isCancelled': false,
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
          'items.isCancelled': false,
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
  getHomepage,
  redirectHomepage,
  getAddProducts,
  addProducts,
  newSku,
  addNewSku,
  saveSku,
  saveSku2,
  getDetailsPage,
  getEditPage,
  updateProduct,
  getSkuEditPage,
  updateProductSku,
  getAddSkusPage,
  deleteProduct,
  deleteSku,
  getUserList,
  getUserDetails,
  blockUser,
  logoutAdmin,
  getCategoriesPage,
  addNewCategory,
  deleteCategory,
  getBannersPage,
  saveBanner,
  setCurrentBanner,
  deleteBanner,
  getOrdersPage,
  changeOrderStatus,
  cancelOrder,
  getCouponPage,
  addCoupon,
  deleteCoupon,
  getDashboard,
  getOrderDetails,
  getProductDetails,
  getSalesReport
}