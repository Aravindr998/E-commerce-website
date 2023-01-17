const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true['Name field cannot be empty']
  },
  caption: {
    type: String
  },
  image: {
    type: String,
    required: true['Image cannot be empty']
  },
  setCurrent: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
})

bannerSchema.pre('find', function(){
  this.where({isDeleted: false})
})
bannerSchema.pre('findOne', function(){
  this.where({isDeleted: false})
})
bannerSchema.pre('findById', function(){
  this.where({isDeleted: false})
})

const Banner = mongoose.model('Banner', bannerSchema)
module.exports = Banner