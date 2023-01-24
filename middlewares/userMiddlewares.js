const userModel = require('../models/users')
const couponModel = require('../models/coupons')
const orderModel = require('../models/orders')
const multer = require('multer')
const puppeteer = require('puppeteer')
const ejs = require('ejs')
const path = require('path')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/products')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  fileFilter : (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if(mimetype && extname){
      return cb(null, true)
    }else{
      return cb(null, false)
    }
  }
})

const checkCoupon = async(req, res, next) => {
  try {
    if(req.session.couponApplied){
      const coupon = await couponModel.findById(req.session.couponApplied.couponId)
      const user = await userModel.findById(req.session.user._id)
      if(coupon.users.includes(req.session.user._id)){
        return res.json({
          successStatus: false,
          message: 'You have already availed this offer'
        })
      }
      let discount;
      if(coupon.minPurchaseValue){
        if(user.cartTotal < coupon.minPurchaseValue){
          req.session.couponApplied = null
          return next()
        } 
        if(coupon.isPercentage){
          discount = user.cartTotal * coupon.discount/100
        }else{
          discount = coupon.discount
        }
        req.session.couponApplied = {
          discount,
          couponId: coupon._id,
          couponCode: coupon.code
        }
        return next()
      }
    }else{
      next()
    }
  } catch (error) {
    console.log(error)
  }
}

const createInvoice = async(req, res, next) => {
  try {
    const user = await userModel.findById(req.session.user._id)
    const order = await orderModel.findById(req.params.id)
    .populate('payment')
    const file = await ejs.renderFile(path.join(__dirname, '../views/users/', 'tax-invoice.ejs'), {user, order})
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(file)
    await page.emulateMediaType('screen')
    await page.pdf({
      path: `./public/invoice/${order._id}.pdf`,
      format: 'A4',
      printBackground: true
    })
    await browser.close()
    next()
  } catch (error) {
    console.log(error)
    res.redirect(`/orders/${req.params.id}`)
  }
}

module.exports = {
  upload,
  checkCoupon,
  createInvoice
}