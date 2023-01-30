const multer = require('multer')
const path = require('path')
const userModel = require('../models/users')
const orderModel = require('../models/orders')
const ejs = require('ejs')
const puppeteer = require('puppeteer')
const { nextTick } = require('process')


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

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/banners')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
  }
})

const bannerUpload = multer({
  storage: bannerStorage,
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

const generatePdf = async(req, res, next) => {
  try {
    const orders = await orderModel.find({isCancelled: false, paymentVerified: true, return: false})
    .populate('customerId')
    .populate('couponId') 
    const file = await ejs.renderFile(path.join(__dirname, '../views/admin', 'sales-report.ejs'), {orders})
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(file)
    await page.emulateMediaType('screen')
    await page.pdf({
      path: './public/files/sales-report.pdf',
      format: 'A4',
      printBackground: true
    })
    await browser.close()
    next()
  } catch (error) {
    console.log(error)
    res.redirect('/admin')
  }
}

module.exports = {
  upload,
  bannerUpload,
  generatePdf
}