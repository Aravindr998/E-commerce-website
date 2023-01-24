const couponModel = require('../models/coupons')

const getCouponPage = async(req, res) => {
  try {
    let message = ""
    let autofill = {}
    if(req.session.Errmessage){
      message = req.session.Errmessage
      req.session.Errmessage = null
      autofill = req.session.coupon
    }
    const coupons = await couponModel.find()
    res.render('admin/coupons/coupons', {coupons, message, autofill})
  } catch (error) {
    console.log(error)
  }
}

const addCoupon = async(req, res) => {
  const expiry = new Date(req.body.expiry+'T23:59:59')
  const coupon = new couponModel({
    code: req.body.code,
    description: req.body.description,
    discount: req.body.discount,
    minPurchaseValue: req.body.minPurchaseValue,
    expiry: expiry
  })
  if(req.body.isPercentage){
    coupon.isPercentage = true
  }
  try {
    const existing = await couponModel.find({code: req.body.code})
    if(existing.length>0){
      req.session.Errmessage = 'Coupon code already exists'
      return res.redirect('/admin/coupons')
    }
    await coupon.save()
    res.redirect('/admin/coupons')
  } catch (error) {
    if(error.errors.code){
      req.session.Errmessage = error.errors.code.properties.message
    }else if(error.errors.minPurchaseValue){
      req.session.Errmessage = error.errors.minPurchaseValue.properties.message
    }else if(error.errors.description){
      req.session.Errmessage = error.errors.description.properties.message
    }else if(error.errors.discount){
      req.session.Errmessage = error.errors.discount.properties.message
    }else if(error.errors.expiry){
      req.session.Errmessage = error.errors.expiry.properties.message
    }
    req.session.coupon = coupon
    res.redirect('/admin/coupons')
  }
}

const deleteCoupon = async(req, res) => {
  try {
    await couponModel.findOneAndUpdate({_id: req.body.id}, {$set: { isDeleted: true }})
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

module.exports = {
  getCouponPage,
  addCoupon,
  deleteCoupon,
}