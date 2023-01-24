const express = require('express')
const userController = require('../controllers/userController')
const { authenticate, isLoggedin, validateAddress, isUserLoggedin } = require('../middlewares/userAuth')
const userMiddlewares = require('../middlewares/userMiddlewares')
const cartController = require('../controllers/usercartController')
const wishlistController = require('../controllers/userwishlistController')
const dashboardController = require('../controllers/userDashboardController')
const checkoutController = require('../controllers/checkoutController')
const orderController = require('../controllers/userOrderController')
const productController = require('../controllers/userProductsController')

const router = express.Router()

router.get('/', userController.getHomepage)

router.get('/login', isLoggedin, userController.getLogin)

router.get('/register', isLoggedin, userController.getRegister)

router.post('/register', isLoggedin, userController.registerUser, userController.generateOtp)

router.post('/login', isLoggedin, userController.loginUser)

router.get('/logout', userController.logoutUser)

router.post('/register/otp', userController.generateOtp, userController.checkOtp)

router.post('/register/otp/resend', userController.resendOtp)

router.get('/products', productController.getProductsPage)

router.get('/products/details/:prodid/:skuid', productController.getDetailsPage)

router.get('/cart', authenticate, cartController.getCartPage)

router.patch('/cart/add/:prodid/:skuid', isUserLoggedin, cartController.addToCart)

router.patch('/cart/update/:id', authenticate, cartController.changeQuantity)

router.patch('/cart/remove/:prodid/:skuid', authenticate, cartController.removeItem)

router.get('/wishlist', authenticate, wishlistController.getWishlishPage)

router.patch('/cart/wishlist/add',authenticate, wishlistController.addToWishlist, cartController.removeItem)

router.patch('/wishlist/cart/add/:prodid/:skuid', authenticate, wishlistController.deleteFromWishlist, cartController.addToCart)

router.patch('/products/wishlist/add', isUserLoggedin, wishlistController.addToWishlist, wishlistController.sendResponse)

router.patch('/wishlist/remove', authenticate, wishlistController.deleteFromWishlist, wishlistController.sendResponse)

router.get('/dashboard', authenticate, dashboardController.getDashboard)

router.get('/dashboard/edit', authenticate, dashboardController.getDashboardEdit)

router.put('/dashboard/edit', authenticate, dashboardController.editUser, userController.generateOtp)

router.put('/dashboard/edit/otp', authenticate, dashboardController.updateUser)

router.get('/dashboard/address/add', authenticate, dashboardController.getAddAddress)

router.post('/dashboard/address/add', authenticate, validateAddress, dashboardController.saveAddress)

router.get('/dashboard/address/edit/:id', authenticate, dashboardController.getEditAddressPage)

router.post('/dashboard/address/update/:id', authenticate, validateAddress, dashboardController.updateAddress)

router.get('/checkout', authenticate, userMiddlewares.checkCoupon, checkoutController.getCheckoutPage)

router.post('/checkout/cod', authenticate, checkoutController.checkoutCod)

router.post('/checkout/razorpay', authenticate, orderController.createOrder)

router.get('/orderplaced', authenticate, checkoutController.getOrderPlacedPage)

router.get('/orders', authenticate, orderController.getOrdersPage)

router.get('/orders/:id', authenticate, orderController.getOrderDetails)

router.patch('/orders/cancel', authenticate, orderController.cancelOrder)

router.patch('/checkout/coupons', authenticate, checkoutController.addCoupon)

router.get('/payment/fail', authenticate, checkoutController.getFailurePage)

router.post('/payment/verify', authenticate, checkoutController.verifyPayment)

router.post('/payment/cancel', authenticate, checkoutController.cancelPayment)

router.post('/payment/fail', authenticate, checkoutController.paymentFailure)

router.patch('/buy-now', isUserLoggedin, cartController.addItemToCart)

router.get('/search', productController.searchProducts)

router.get('/products/filter', productController.filterProducts)

router.get('/forgot-password', isLoggedin, userController.getForgotPasswordPage)

router.post('/forgot-password/mail', isLoggedin, userController.checkUser)

router.get('/forgot-password/:id', isLoggedin, userController.getEnterOtpPage)

router.post('/forgot-password/otp/:id', isLoggedin, userController.checkMailOtp)

router.get('/password/reset/:id', isLoggedin, userController.getResetPasswordPage)

router.post('/password/reset/:id', isLoggedin, userController.resetPassword)

router.get('/invoice/download/:id', authenticate, userMiddlewares.createInvoice, orderController.downloadInvoice)

module.exports = router