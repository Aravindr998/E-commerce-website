const mongoose = require('mongoose')

const productSkuSchema = new mongoose.Schema({
  color:  {
    type: String,
    required: [true, 'Color cannot be empty']
  },
  highlights: {
    type: String,
    required: [true, 'Highlights cannot be empty']
  },
  price: {
    type: Number,
    required: [true, 'Price cannot be empty']
  },
  dimension: {
    type: String,
    required: [true, 'Dimensions cannot be empty']
  },
  images: {
    type: String,
    required: [true, 'Images cannot be empty']
  },
  totalStock: {
    type: Number,
    required: [true, 'Stock cannot be empty']
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
    type: [Number],
  },
  skus: {
    type: [{
      color:  {
        type: String,
        required: [true, 'Color cannot be empty']
      },
      highlights: {
        type: String,
        required: [true, 'Highlights cannot be empty']
      },
      price: {
        type: Number,
        required: [true, 'Price cannot be empty']
      },
      dimension: {
        type: String,
        required: [true, 'Dimensions cannot be empty']
      },
      images: {
        type: [String],
        required: [true, 'Images cannot be empty']
      },
      totalStock: {
        type: Number,
        required: [true, 'Stock cannot be empty']
      },
      stockLeft: {
        type: Number
      }
    }],
    required: true
  },
  categoryId: {
    type: String,
    required: true
  }
})

const Products = mongoose.model('Products', productSchema)
module.exports = Products