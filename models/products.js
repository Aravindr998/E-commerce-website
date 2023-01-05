const mongoose = require('mongoose')

const productSkuSchema = new mongoose.Schema({
  color:  {
    type: String,
    required: true
  },
  highlights: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  dimension: {
    type: String,
    required: true
  },
  images: {
    type: String,
    required: true
  },
  totalStock: {
    type: Number,
    required: true
  },
  stockLeft: {
    type: Number
  }
})

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Product title is required"]
  },
  warranty: {
    type: String,
    required: [true, "Product warranty details is required"]
  },
  rating: {
    type: Number,
  },
  skus: [productSkuSchema],
  categoryId: {
    type: String,
    required: true
  }
})

const Products = mongoose.model('Products', productSchema)
module.exports = Products