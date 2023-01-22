const express = require('express')
const adminController = require('../controllers/adminController')
const adminMiddlewares = require('../middlewares/adminMiddlewares')
const { isLoggedin, authenticate, validateLogin } = require('../middlewares/adminAuth')
const router = express.Router()




router.get('/login',isLoggedin, adminController.getLogin)

router.post('/login', isLoggedin, validateLogin, adminController.redirectHomepage)

//products

router.get('/',authenticate, adminController.getDashboard)

router.get('/products', authenticate, adminController.getHomepage)

router.get('/products/new',authenticate, adminController.getAddProducts)

router.post('/products/new',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.addProducts)

router.get('/products/new/skus',authenticate, adminController.newSku)

router.post('/products/new/skus',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.addNewSku)

router.post('/products/new/skus/new',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.saveSku)

router.post('/products/new/skus/new/2',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.saveSku2)

router.get('/products/view/:id',authenticate, adminController.getDetailsPage)

router.get('/products/edit/:id',authenticate, adminController.getEditPage)

router.put('/products/edit/:id',authenticate, adminController.updateProduct)

router.get('/products/edit/:prodid/:skuid',authenticate, adminController.getSkuEditPage)

router.put('/products/edit/skus/:id',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.updateProductSku)

router.get('/products/skus/add/:id',authenticate, adminController.getAddSkusPage)

router.patch('/products/delete/:id',authenticate, adminController.deleteProduct)

router.patch('/products/delete/skus/:prodId/:skuId',authenticate, adminController.deleteSku)

//users

router.get('/users', authenticate, adminController.getUserList)

router.get('/users/view/:id', authenticate, adminController.getUserDetails)

router.put('/users/block/:id', authenticate, adminController.blockUser)

//categories

router.get('/categories', authenticate, adminController.getCategoriesPage)

router.post('/categories', authenticate, adminController.addNewCategory)

router.patch('/categories/:id', authenticate, adminController.deleteCategory)

router.get('/logout', adminController.logoutAdmin)

//banner

router.get('/banner', authenticate, adminController.getBannersPage)

router.post('/banner', authenticate, adminMiddlewares.bannerUpload.single('image'), adminController.saveBanner)

router.patch('/banner/:id', authenticate, adminController.setCurrentBanner)

router.delete('/banner/:id', authenticate, adminController.deleteBanner)

//orders

router.get('/orders', authenticate, adminController.getOrdersPage)

router.patch('/orders', authenticate, adminController.changeOrderStatus)

router.patch('/orders/cancel', authenticate, adminController.cancelOrder)

//coupons

router.get('/coupons', authenticate, adminController.getCouponPage)

router.post('/coupons', authenticate, adminController.addCoupon)

router.patch('/coupons', authenticate, adminController.deleteCoupon)

//dashboard

router.get('/order-details', authenticate, adminController.getOrderDetails)

router.get('/product-details', authenticate, adminController.getProductDetails)

router.get('/sales/download', authenticate, adminController.getSalesReport)

module.exports = router