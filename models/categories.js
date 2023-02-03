const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: [true, 'Category name cannot be empty']
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  offerPercent: {
    type: Number
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})

categorySchema.pre('find', function(){
  this.where({isDeleted: false})
})
categorySchema.pre('findOne', function(){
  this.where({isDeleted: false})
})
categorySchema.pre('findById', function(){
  this.where({isDeleted: false})
})
categorySchema.virtual('products',{
  ref: 'Products',
  localField: '_id',
  foreignField: 'categoryId'
})

const Category = mongoose.model('Category', categorySchema)
module.exports = Category