const express = require('express')
const userController = require('../controllers/userController')
const userAuth = require('../middlewares/userAuth')
const userMiddlewares = require('../middlewares/userMiddlewares')

const router = express.Router()

router.get('/', userController.getHomepage)

router.get('/login', userAuth.isLoggedin, userController.getLogin)

router.get('/register', userAuth.isLoggedin, userController.getRegister)

router.post('/register', userAuth.isLoggedin, userController.registerUser, userController.generateOtp)

router.post('/login', userAuth.isLoggedin, userController.loginUser)

router.get('/logout', userController.logoutUser)

router.post('/register/otp', userController.generateOtp, userController.checkOtp)

router.post('/register/otp/resend', userController.resendOtp)

router.get('/products', userAuth.authenticate, userController.getProductsPage)

router.get('/products/details/:prodid/:skuid', userAuth.authenticate, userController.getDetailsPage)

router.get('/cart', userAuth.authenticate, userController.getCartPage)

router.patch('/cart/add/:prodid/:skuid', userAuth.authenticate, userController.addToCart)

router.patch('/cart/update/:id', userAuth.authenticate, userController.changeQuantity)

router.patch('/cart/remove/:prodid/:skuid', userAuth.authenticate, userController.removeItem)

router.get('/wishlist', userAuth.authenticate, userController.getWishlishPage)

router.patch('/cart/wishlist/add',userAuth.authenticate, userController.addToWishlist, userController.removeItem)

router.patch('/wishlist/cart/add/:prodid/:skuid', userAuth.authenticate, userController.deleteFromWishlist, userController.addToCart)

router.patch('/products/wishlist/add', userAuth.authenticate, userController.addToWishlist, userController.sendResponse)

router.patch('/wishlist/remove', userAuth.authenticate, userController.deleteFromWishlist, userController.sendResponse)

router.get('/dashboard', userAuth.authenticate, userController.getDashboard)

router.get('/dashboard/edit', userAuth.authenticate, userController.getDashboardEdit)

router.put('/dashboard/edit', userAuth.authenticate, userController.editUser, userController.generateOtp)

router.put('/dashboard/edit/otp', userAuth.authenticate, userController.updateUser)

router.get('/dashboard/address/add', userAuth.authenticate, userController.getAddAddress)

router.post('/dashboard/address/add', userAuth.authenticate, userAuth.validateAddress, userController.saveAddress)

router.get('/dashboard/address/edit/:id', userAuth.authenticate, userController.getEditAddressPage)

router.post('/dashboard/address/update/:id', userAuth.authenticate, userAuth.validateAddress, userController.updateAddress)

router.get('/checkout', userAuth.authenticate, userMiddlewares.checkCoupon, userController.getCheckoutPage)

router.post('/checkout/cod', userAuth.authenticate, userController.checkoutCod)

router.get('/orderplaced', userAuth.authenticate, userController.getOrderPlacedPage)

router.get('/orders', userAuth.authenticate, userController.getOrdersPage)

router.get('/orders/:id', userAuth.authenticate, userController.getOrderDetails)

router.patch('/orders/cancel', userAuth.authenticate, userController.cancelOrder)

router.patch('/checkout/coupons', userAuth.authenticate, userController.addCoupon)

router.post('/checkout/payment', userAuth.authenticate, userController.checkOrder)

router.get('/payment/:id/success', userAuth.authenticate, userController.getSuccessPage)

router.get('/payment/failed/:id', userAuth.authenticate, userController.getFailurePage)

module.exports = router