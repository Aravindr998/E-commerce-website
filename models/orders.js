const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true
    },
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    productName: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  address: {
    type: {
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
    },
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentVerified: {
    type: Boolean,
    default: false
  },
  orderStatus: {
    type: String,
    required: true
  }
})

const Orders = mongoose.model('Orders', orderSchema)
module.exports = Orders