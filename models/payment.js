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
    default: 'Stripe'
  },
  stripeSessionId: {
    type: String,
    required: true
  },
  status:{
    type: Boolean,
    required: true
  }
})

const Payments = mongoose.model('Payments', paymentSchema)
module.exports = Payments