const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const mongoose = require('mongoose')

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

module.exports = {
  getProductsPage,
  getDetailsPage,
  searchProducts,
  filterProducts
}