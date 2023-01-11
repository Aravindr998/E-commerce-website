const mongoose = require('mongoose')

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
      },
      isDeleted: {
        type: Boolean,
        default: false
      }
    }],
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
})

productSchema.pre('find', function(){
  console.log('pre find product')
  this.where({isDeleted: false})
})
productSchema.pre('findOne', function(){
  console.log('pre findOne product')
  this.where({isDeleted: false})
})
productSchema.pre('findById', function(){
  console.log('pre findById product')
  this.where({isDeleted: false})
})
productSchema.pre('findOneAndUpdate', function(){
  console.log('pre findOneAndUpdate product')
  this.where({isDeleted: false})
})

const Products = mongoose.model('Products', productSchema)
module.exports = Products