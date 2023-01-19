const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code cannot be empty'],
    maxLength: [6, 'Coupon code must be less than 6 characters'],
    minLength: [3, 'Coupon code must be atleast 3 characters'],
    uppercase: true
  },
  description: {
    type: String,
    required: [true, 'Description cannot be empty']
  },
  isPercentage: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    required: [true, 'Discount value cannot be empty']
  },
  minPurchaseValue: {
    type: Number
  },
  expiry: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, 
{
  timestamps: true
})

couponSchema.pre('find', function(){
  this.where('expiry').gte(new Date()).where({isDeleted: false})
})
couponSchema.pre('findOne', function(){
  this.where('expiry').gte(new Date()).where({isDeleted: false})
})
couponSchema.pre('findById', function(){
  this.where('expiry').gte(new Date()).where({isDeleted: false})
})
couponSchema.pre('findOneAndDelete', function(){
  this.where('expiry').gte(new Date()).where({isDeleted: false})
})
couponSchema.pre('findOneAndUpdate', function(){
  this.where('expiry').gte(new Date()).where({isDeleted: false})
})

const Coupon = mongoose.model('Coupon', couponSchema)
module.exports = Coupon