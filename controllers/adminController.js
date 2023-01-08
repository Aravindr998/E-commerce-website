const adminModel = require('../models/admin')
const userModel = require('../models/users')
const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const mongoose = require('mongoose')


module.exports = {
  isLoggedin: (req, res, next) => {
    if(req.session.admin){
      res.redirect('/admin')
    }else if(req.session.user){
      res.redirect('/')
    }else{
      next()
    }
  },

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

  loginAdmin: async (req, res) => {
    try{
      if(req.body.email == "" || req.body.password == ""){
        req.session.Errmessage = "Email and password cannot be empty"
        return res.redirect('/admin/login')
      }
      const admin = await adminModel.find({email: req.body.email})
      if(admin.length == 0){
        req.session.Errmessage = "Invalid Email"
        return res.redirect('/admin/login')
      }else if(req.body.password != admin[0].password){
        req.session.Errmessage = "Invalid password"
        return res.redirect('/admin/login')
      }else{
        req.session.admin = admin[0]
        res.redirect('/admin')
      }
    }catch(error){
      return res.status(500).send(error)
    }
  },
  authenticate: (req, res, next) => {
    if(req.session.admin){
      next()
    }else if(req.session.user){
      return res.redirect('/')
    }else{
      return res.redirect('/admin/login')
    }
  },
  getHomepage: async (req, res) => {
    const product = await productModel.find()
    res.render('admin/admin-dashboard', {product})
  },
  getAddProducts: async (req, res) => {
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
  },
  addProducts: async(req, res) => {
    const existing = await productModel.find({title: req.body.title})
    const images = []
    console.log(req.files)
    for(key in req.files){
      const paths = req.files[key][0].path
      images.push(paths.slice(7))
    }
      // req.files.forEach(element => {
      //   images.push(element.path.slice(7))
      // })
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
  },

  newSku: async (req, res) => {
    if(req.session.addProducts || req.session.update){
      const categories = await categoryModel.find()
      const product = req.session.addProducts
      const skus = req.session.skus || {}
      const message = req.session.Errmessage || ""
      req.session.addProducts = null
      req.session.Errmessage = null
      req.session.skus = null
      return res.render('admin/new-sku', {product, skus, categories, message})
    }else{
      return res.redirect('/admin')
    }
  },

  addNewSku: async (req, res) => {
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
  },
  saveSku: async(req, res, next) => {
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
    
  },

  saveSku2: async(req, res, next) => {
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
    
  },

  getDetailsPage: async(req, res) => {
    const id = req.params.id
    const product = await productModel.findById({_id: id})
    const categories = await categoryModel.find()
    return res.render('admin/product-details', {product, categories})
  },

  getEditPage: async(req, res) => {
    const id = req.params.id
    const product = await productModel.findById({_id: id})
    const categories = await categoryModel.find()
    return res.render('admin/product-edit', {product, categories})
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
  },

  updateProductSku: async (req, res) => {
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
      images.splice(0,1,paths.slice(7))
    }
    if(req.files.image2){
      const paths = req.files.image2[0].path
      images.splice(1,1,paths.slice(7))
    }
    if(req.files.image3){
      const paths = req.files.image3[0].path
      images.splice(2,1,paths.slice(7))
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
  }
}