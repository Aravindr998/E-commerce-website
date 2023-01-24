const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const mongoose = require('mongoose')

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

module.exports = {
  getCategoriesPage,
  addNewCategory,
  deleteCategory,
}