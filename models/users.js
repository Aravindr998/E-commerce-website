const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const addressSchema = new mongoose.Schema({
  state: {
    type: String,
  },
  street1: {
    type: String
  },
  street2: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  zip: {
    type: Number
  }
})

const cartSchema = new mongoose.Schema({
  productId: {
    type: String,
  },
  quantity: {
    type: Number
  }
})

const wishlistSchema = new mongoose.Schema({
  productId: {
    type: String
  }
})

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, 'First name cannot be empty'],
  },
  lname: {
    type: String,
    required: [true, 'Last name cannot be empty']
  },
  email: {
    type: String,
    required: [true, 'Email cannot be empty'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number cannot be empty'],
    minlength: [10, `Phone number must be atleast 10 digits`],
    maxlength: [13, `Phone number must be less than 12 digits`]
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty']
  },
  shippingAddress: {
    
  },
  billingAddress: addressSchema,
  shippingAddress: [addressSchema],
  isBlocked: {
    type: Boolean,
    default: false
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String
  },
  cart: [cartSchema],
  wishlist: [wishlistSchema]
})

userSchema.pre('save', async function(next){
  try {
    hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword
    next();
  } catch (error) {
    console.log(error)
  }
})

const User = mongoose.model('User', userSchema)
module.exports = User