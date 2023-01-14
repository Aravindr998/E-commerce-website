const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

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
    minlength: [10, `Phone number must be 10 digits`],
    maxlength: [10, `Phone number must be 10 digits`]
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty']
  },
  billingAddress: {
    type: {
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
    }
  },
  shippingAddress: [{
    type: {
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
    }
  }],
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
  cart: {
    type: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
      },
      skuId:{
        type: mongoose.Schema.Types.ObjectId
      },
      quantity: {
        type: Number
      },
      skus: {
        type: Array 
      }
    }]
  },
  cartTotal: {
    type: Number,
    default: 0
  },
  wishlist: [{
    type: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
      },
      skuId: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  }]
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