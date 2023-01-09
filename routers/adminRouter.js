const express = require('express')
const adminController = require('../controllers/adminController')
// const { upload } = require('../config/fileUpload')
const multer = require('multer')
const path = require('path')

const router = express.Router()

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



router.get('/login',adminController.isLoggedin, adminController.getLogin)

router.post('/login', adminController.isLoggedin, adminController.loginAdmin)

router.get('/', adminController.authenticate, adminController.getHomepage)

router.get('/products/new', adminController.authenticate, adminController.getAddProducts)

router.post('/products/new', adminController.authenticate, upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.addProducts)

router.get('/products/new/skus', adminController.authenticate, adminController.newSku)

router.post('/products/new/skus', adminController.authenticate, upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.addNewSku)

router.post('/products/new/skus/new', adminController.authenticate, upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.saveSku)

router.post('/products/new/skus/new/2', adminController.authenticate, upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.saveSku2)

router.get('/products/view/:id', adminController.authenticate, adminController.getDetailsPage)

router.get('/products/edit/:id', adminController.authenticate, adminController.getEditPage)

router.put('/products/edit/:id', adminController.authenticate, adminController.updateProduct)

router.get('/products/edit/:prodid/:skuid', adminController.authenticate, adminController.getSkuEditPage)

router.put('/products/edit/skus/:id', adminController.authenticate, upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.updateProductSku)

router.get('/products/skus/add/:id', adminController.authenticate, adminController.getAddSkusPage)

router.delete('/products/delete/:id', adminController.authenticate, adminController.deleteProduct)

router.delete('/products/delete/skus/:prodId/:skuId', adminController.authenticate, adminController.deleteSku)

module.exports = router