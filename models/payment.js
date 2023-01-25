const mongoose =  require('mongoose')

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentGateway: {
    type: String,
    default: 'Razorpay'
  },
  paymentId: {
    type: String,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  paymentSignature: {
    type: String,
    required: true
  },
  status:{
    type: Boolean,
    required: true
  },
  refund: {
    type: Boolean,
    default: false
  },
  refundId: {
    type: String
  },
  refundStatus: {
    type: String
  }
})

const Payments = mongoose.model('Payments', paymentSchema)
module.exports = Payments