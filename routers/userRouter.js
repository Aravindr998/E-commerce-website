const express = require('express')
const userController = require('../controllers/userController')
const { authenticate, isLoggedin, validateAddress, isUserLoggedin } = require('../middlewares/userAuth')
const userMiddlewares = require('../middlewares/userMiddlewares')

const router = express.Router()

router.get('/', userController.getHomepage)

router.get('/login', isLoggedin, userController.getLogin)

router.get('/register', isLoggedin, userController.getRegister)

router.post('/register', isLoggedin, userController.registerUser, userController.generateOtp)

router.post('/login', isLoggedin, userController.loginUser)

router.get('/logout', userController.logoutUser)

router.post('/register/otp', userController.generateOtp, userController.checkOtp)

router.post('/register/otp/resend', userController.resendOtp)

router.get('/products', userController.getProductsPage)

router.get('/products/details/:prodid/:skuid', userController.getDetailsPage)

router.get('/cart', authenticate, userController.getCartPage)

router.patch('/cart/add/:prodid/:skuid', isUserLoggedin, userController.addToCart)

router.patch('/cart/update/:id', authenticate, userController.changeQuantity)

router.patch('/cart/remove/:prodid/:skuid', authenticate, userController.removeItem)

router.get('/wishlist', authenticate, userController.getWishlishPage)

router.patch('/cart/wishlist/add',authenticate, userController.addToWishlist, userController.removeItem)

router.patch('/wishlist/cart/add/:prodid/:skuid', authenticate, userController.deleteFromWishlist, userController.addToCart)

router.patch('/products/wishlist/add', isUserLoggedin, userController.addToWishlist, userController.sendResponse)

router.patch('/wishlist/remove', authenticate, userController.deleteFromWishlist, userController.sendResponse)

router.get('/dashboard', authenticate, userController.getDashboard)

router.get('/dashboard/edit', authenticate, userController.getDashboardEdit)

router.put('/dashboard/edit', authenticate, userController.editUser, userController.generateOtp)

router.put('/dashboard/edit/otp', authenticate, userController.updateUser)

router.get('/dashboard/address/add', authenticate, userController.getAddAddress)

router.post('/dashboard/address/add', authenticate, validateAddress, userController.saveAddress)

router.get('/dashboard/address/edit/:id', authenticate, userController.getEditAddressPage)

router.post('/dashboard/address/update/:id', authenticate, validateAddress, userController.updateAddress)

router.get('/checkout', authenticate, userMiddlewares.checkCoupon, userController.getCheckoutPage)

router.post('/checkout/cod', authenticate, userController.checkoutCod)

router.post('/checkout/razorpay', authenticate, userController.createOrder)

router.get('/orderplaced', authenticate, userController.getOrderPlacedPage)

router.get('/orders', authenticate, userController.getOrdersPage)

router.get('/orders/:id', authenticate, userController.getOrderDetails)

router.patch('/orders/cancel', authenticate, userController.cancelOrder)

router.patch('/checkout/coupons', authenticate, userController.addCoupon)

router.get('/payment/fail', authenticate, userController.getFailurePage)

router.post('/payment/verify', authenticate, userController.verifyPayment)

router.post('/payment/cancel', authenticate, userController.cancelPayment)

router.post('/payment/fail', authenticate, userController.paymentFailure)

router.patch('/buy-now', isUserLoggedin, userController.addItemToCart)

router.get('/search', userController.searchProducts)

router.get('/products/filter', userController.filterProducts)

router.get('/forgot-password', isLoggedin, userController.getForgotPasswordPage)

router.post('/forgot-password/mail', isLoggedin, userController.checkUser)

router.get('/forgot-password/:id', isLoggedin, userController.getEnterOtpPage)

router.post('/forgot-password/otp/:id', isLoggedin, userController.checkMailOtp)

router.get('/password/reset/:id', isLoggedin, userController.getResetPasswordPage)

router.post('/password/reset/:id', isLoggedin, userController.resetPassword)

router.get('/invoice/download/:id', authenticate, userMiddlewares.createInvoice, userController.downloadInvoice)

router.get('/invoice', userController.temp)

module.exports = router