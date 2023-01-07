const adminModel = require('../models/admin')
const userModel = require('../models/users')
const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const { findOne, findOneAndUpdate } = require('../models/products')


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
    }else{
      res.redirect('/admin/login')
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
      req.files.forEach(element => {
        images.push(element.path.slice(7))
      })
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
  },

  newSku: async (req, res) => {
    if(req.session.addProducts){
      const categories = await categoryModel.find()
      const product = req.session.addProducts
      const skus = {}
      req.session.addProducts = null
      res.render('admin/new-sku', {product, skus, categories})
    }else{
      res.redirect('/admin')
    }
  },

  addNewSku: async (req, res) => {
    const existing = await productModel.find({title: req.body.title})
    const images = []
      req.files.forEach(element => {
        images.push(element.path.slice(7))
      })
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
      req.files.forEach(element => {
        images.push(element.path.slice(7))
      })
    const skus = {
      color: req.body.color,
      price: req.body.stock,
      totalStock: req.body.stock,
      highlights: req.body.highlights,
      dimension: req.body.dimension,
      images
    }
    product.skus.forEach(item => {
      if(item.color == req.body.color){
        req.session.Errmessage = "Sku already exists"
        req.session.addProducts = product
        req.session.skus = skus
        return res.redirect('/admin/product/new/skus')
      }
    })
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
      return res.redirect('/admin')
    } catch (error) {
      console.log(error)
      req.session.Errmessage = "Some error occured"
        // const length = skus.length
        // if(error.errors.skus['length'].color){
        //   req.session.Errmessage = error.errors.skus['length'].color.properties.message
        // }else if(error.errors.skus['length'].highlights){
        //   req.session.Errmessage = error.errors.skus['length'].highlights.properties.message
        // }else if(error.errors.skus['length'].dimension){
        //   req.session.Errmessage = error.errors.skus['length'].dimension.properties.message
        // }else if(error.errors.skus['length'].price){
        //   req.session.Errmessage = error.errors.skus['length'].price.properties.message
        // }else if(error.errors.skus['length'].totalStock){
        //   req.session.Errmessage = error.errors.skus['length'].totalStock.properties.message
        // }
        req.session.addProducts = product
        req.session.skus = skus
        res.redirect('/admin/products/new/skus')
    }
    
  }
}