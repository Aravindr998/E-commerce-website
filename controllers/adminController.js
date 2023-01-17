const userModel = require('../models/users')
const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const bannerModel = require('../models/banners')
const orderModel = require('../models/orders')
const mongoose = require('mongoose')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const path = require('path')


module.exports = {
  getLogin: (req, res) => {
    if(req.session.Errmessage){
      const message = req.session.Errmessage
      req.session.Errmessage = null
      res.render('admin/admin-login', {message})
    }else{
      const message = ""
      res.render('admin/admin-login', {message})
    }
  },
  getHomepage: async (req, res) => {
    try {
      const product = await productModel.find().populate('categoryId')
      res.render('admin/admin-dashboard', {product})
    } catch (error) {
      console.log(error)
    }
  },
  redirectHomepage: async(req, res) => {
    return res.redirect('/admin')
  },
  getAddProducts: async (req, res) => {
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
  },
  addProducts: async(req, res) => {
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
          return res.redirect('/admin')
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
  },

  newSku: async (req, res) => {
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
        return res.redirect('/admin')
      }
    } catch (error) {
      console.log(error)
    }
  },

  addNewSku: async (req, res) => {
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
  },
  saveSku: async(req, res, next) => {
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
        return res.redirect('/admin')
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
    
  },

  saveSku2: async(req, res, next) => {
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
    
  },

  getDetailsPage: async(req, res) => {
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
        return res.redirect('/admin')
      }
    } catch (error) {
      console.log(error)
    }
  },

  getEditPage: async(req, res) => {
    try {
      const id = req.params.id
      const product = await productModel.findById({_id: id})
      const categories = await categoryModel.find()
      return res.render('admin/product-edit', {product, categories})
    } catch (error) {
      console.log(error)
    }
  },

  updateProduct: async (req, res) => {
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
  },

  getSkuEditPage: async (req, res) => {
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
  },

  updateProductSku: async (req, res) => {
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
          redirect: '/admin'
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
  },

  getAddSkusPage: async (req, res) => {
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
  },

  deleteProduct: async (req, res) => {
    const id = req.params.id
    try {
      await productModel.findOneAndUpdate({_id: id}, {$set: {isDeleted: true, "skus.$[].isDeleted": true}})
      return res.json({
        successStatus: true,
        redirect: '/admin'
      })
    } catch (error) {
      console.log(error)
      return res.json({
        successStatus: false,
        message: 'Some error occured, please try again later'
      })
    }
  },

  deleteSku: async (req, res) => {
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
          redirect: '/admin'
        })
      }else{
        const result = await productModel.findOneAndUpdate({skus: {$elemMatch: {_id: id}}}, {
          $set: {
            'skus.$.isDeleted': true,
          }
        })
        return res.json({
          successStatus: true,
          redirect: '/admin'
        })
      }
    }catch (error) {
      console.log(error)
      return res.json({
        successStatus: false,
        message: 'Some error occured please try again later'
      })
    }
  },

  //users

  getUserList: async(req, res)=> {
    try {
      const users = await userModel.find().sort({fname: 1})
      res.render('admin/user/user-list', {users})
    } catch (error) {
      console.log(error)
    }
  },

  getUserDetails: async(req, res) => {
    try {
      id = req.params.id
      const user = await userModel.findById(id)
      res.render('admin/user/user-details', {user})
    } catch (error) {
      console.log(error)
    }
  },

  blockUser: async(req, res) => {
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
    
  },

  logoutAdmin: (req, res) => {
      req.session.admin = null
      res.redirect('/admin')
  },

  //categories

  getCategoriesPage: async(req, res) => {
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
  },

  addNewCategory: async(req, res) => {
    const category = new categoryModel({
      categoryName: req.body.category
    })
    try {
      await category.save()
      res.redirect('/admin/categories')
    } catch (error) {
      req.session.Errmessage = error.errors.categoryName.properties.message
      res.redirect('/admin/categories')
    }
  },

  deleteCategory: async(req, res) => {
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
  },

  //banners

  getBannersPage: async(req, res) => {
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
  },
  saveBanner: async(req, res) => {
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
  },
  setCurrentBanner: async(req, res) => {
    try {
      await bannerModel.updateMany({setCurrent: true}, {$set: {setCurrent: false}})
      await bannerModel.findOneAndUpdate({_id: req.body.bannerId}, {$set: {setCurrent: true}})
      console.log('done')
      res.json({successStatus: true})
    } catch (error) {
      console.log(error)
      res.json({successStatus: false})
    }
  },

  deleteBanner: async(req, res) => {
    try {
      await bannerModel.findOneAndUpdate({_id: req.params.id}, {$set: {isDeleted: true}})
      res.json({successStatus: true})
    } catch (error) {
      console.log(error)
      res.json({successStatus: false})
    }
  },

  getOrdersPage: async(req, res) => {
    try {
      const orders = await orderModel.find()
      .populate('customerId')
      res.render('admin/orders/order', {orders})
    } catch (error) {
      console.log(error)
    }
  }
}