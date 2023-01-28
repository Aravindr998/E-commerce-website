const express = require('express')
const adminController = require('../controllers/adminController')
const adminMiddlewares = require('../middlewares/adminMiddlewares')
const { isLoggedin, authenticate, validateLogin } = require('../middlewares/adminAuth')
const productController = require('../controllers/adminProductController')
const userController = require('../controllers/adminUserController')
const bannerController = require('../controllers/adminBannerController')
const categoryController = require('../controllers/categoryController')
const orderController = require('../controllers/adminOrderController')
const couponController = require('../controllers/adminCouponController')
const router = express.Router()




router.get('/login',isLoggedin, adminController.getLogin)

router.post('/login', isLoggedin, validateLogin, adminController.redirectHomepage)

router.get('/logout',authenticate, adminController.logoutAdmin)

//products

router.get('/',authenticate, adminController.getDashboard)

router.get('/products', authenticate, productController.getHomepage)

router.get('/products/new',authenticate, productController.getAddProducts)

router.post('/products/new',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), productController.addProducts)

router.get('/products/new/skus',authenticate, productController.newSku)

router.post('/products/new/skus',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), productController.addNewSku)

router.post('/products/new/skus/new',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), productController.saveSku)

router.post('/products/new/skus/new/2',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), productController.saveSku2)

router.get('/products/view/:id',authenticate, productController.getDetailsPage)

router.get('/products/edit/:id',authenticate, productController.getEditPage)

router.put('/products/edit/:id',authenticate, productController.updateProduct)

router.get('/products/edit/:prodid/:skuid',authenticate, productController.getSkuEditPage)

router.put('/products/edit/skus/:id',authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), productController.updateProductSku)

router.get('/products/skus/add/:id',authenticate, productController.getAddSkusPage)

router.patch('/products/delete/:id',authenticate, productController.deleteProduct)

router.patch('/products/delete/skus/:prodId/:skuId',authenticate, productController.deleteSku)

//users

router.get('/users', authenticate, userController.getUserList)

router.get('/users/view/:id', authenticate, userController.getUserDetails)

router.put('/users/block/:id', authenticate, userController.blockUser)

//categories

router.get('/categories', authenticate, categoryController.getCategoriesPage)

router.post('/categories', authenticate, categoryController.addNewCategory)

router.patch('/categories/:id', authenticate, categoryController.deleteCategory)


//banner

router.get('/banner', authenticate, bannerController.getBannersPage)

router.post('/banner', authenticate, adminMiddlewares.bannerUpload.single('image'), bannerController.saveBanner)

router.patch('/banner/:id', authenticate, bannerController.setCurrentBanner)

router.delete('/banner/:id', authenticate, bannerController.deleteBanner)

//orders

router.get('/orders', authenticate, orderController.getOrdersPage)

router.patch('/orders', authenticate, orderController.changeOrderStatus)

router.patch('/orders/cancel', authenticate, orderController.cancelOrder)

//coupons

router.get('/coupons', authenticate, couponController.getCouponPage)

router.post('/coupons', authenticate, couponController.addCoupon)

router.patch('/coupons', authenticate, couponController.deleteCoupon)

//dashboard

router.get('/order-details', authenticate, adminController.getOrderDetails)

router.get('/product-details', authenticate, adminController.getProductDetails)

router.get('/sales/download', authenticate, adminController.getSalesReport)

//offers

router.patch('/products/offer/add', authenticate, productController.addProductOffer)

router.patch('/products/offer/remove', authenticate, productController.removeOffer)

module.exports = router