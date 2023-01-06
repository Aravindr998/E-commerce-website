const adminModel = require('../models/admin')
const userModel = require('../models/users')
const productModel = require('../models/products')
const categoryModel = require('../models/categories')


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
      req.session.Errmessage = null
      req.session.product = null
      return res.render('admin/add-products', {categories, message, product})
    }else{
      const message = ""
      const product = {}
      return res.render('admin/add-products', {categories, message, product})
    }
  },
  addProducts: async(req, res) => {
    const existing = await productModel.find({title: req.body.title})
    if(existing.length == 0){
      const images = []
      req.files.forEach(element => {
        images.push('./'+element.path)
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
        }else{
          req.session.Errmessage = "Some error"
          console.log(error)
        }
        req.session.addProducts = product
        return res.redirect('/admin/products/new')
      }
    }else{
      req.session.Errmessage = "Product already exists"
      req.session.addProducts = product
      return res.redirect('/admin/products/new')
    }
  }
}