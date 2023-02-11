const express = require('express')
const userController = require('../controllers/userController')
const { authenticate, isLoggedin, validateAddress, validateUpdateAddress, isUserLoggedin, isUserBlocked } = require('../middlewares/userAuth')
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

router.get('/cart', isUserBlocked, authenticate, cartController.getCartPage)

router.patch('/cart/add/:prodid/:skuid', isUserLoggedin, cartController.addToCart)

router.patch('/cart/update/:id', isUserBlocked, authenticate, cartController.changeQuantity)

router.patch('/cart/remove/:prodid/:skuid', isUserBlocked, authenticate, cartController.removeItem)

router.get('/wishlist', isUserBlocked, authenticate, wishlistController.getWishlishPage)

router.patch('/cart/wishlist/add',isUserBlocked, authenticate, wishlistController.addToWishlist, cartController.removeItem)

router.patch('/wishlist/cart/add/:prodid/:skuid', isUserBlocked, authenticate, wishlistController.deleteFromWishlist, cartController.addToCart)

router.patch('/products/wishlist/add', isUserLoggedin, wishlistController.addToWishlist, wishlistController.sendResponse)

router.patch('/wishlist/remove', isUserBlocked, authenticate, wishlistController.deleteFromWishlist, wishlistController.sendResponse)

router.get('/dashboard', isUserBlocked, authenticate, dashboardController.getDashboard)

router.get('/dashboard/edit', isUserBlocked, authenticate, dashboardController.getDashboardEdit)

router.put('/dashboard/edit', isUserBlocked, authenticate, dashboardController.editUser, userController.generateOtp)

router.put('/dashboard/edit/otp', isUserBlocked, authenticate, dashboardController.updateUser)

router.get('/dashboard/address/add', isUserBlocked, authenticate, dashboardController.getAddAddress)

router.post('/dashboard/address/add', isUserBlocked, authenticate, validateAddress, dashboardController.saveAddress)

router.get('/dashboard/address/edit/:id', isUserBlocked, authenticate, dashboardController.getEditAddressPage)

router.post('/dashboard/address/update/:id', isUserBlocked, authenticate, validateUpdateAddress, dashboardController.updateAddress)

router.get('/checkout', isUserBlocked, authenticate, userMiddlewares.checkCoupon, checkoutController.getCheckoutPage)

router.post('/checkout/cod', isUserBlocked, authenticate, checkoutController.checkoutCod)

router.post('/checkout/razorpay', isUserBlocked, authenticate, orderController.createOrder)

router.get('/orderplaced', isUserBlocked, authenticate, checkoutController.getOrderPlacedPage)

router.get('/orders', isUserBlocked, authenticate, orderController.getOrdersPage)

router.get('/orders/:id', isUserBlocked, authenticate, orderController.getOrderDetails)

router.patch('/orders/cancel', isUserBlocked, authenticate, orderController.cancelOrder)

router.patch('/checkout/coupons', isUserBlocked, authenticate, checkoutController.addCoupon)

router.get('/payment/fail', isUserBlocked, authenticate, checkoutController.getFailurePage)

router.post('/payment/verify', isUserBlocked, authenticate, checkoutController.verifyPayment)

router.post('/payment/cancel', isUserBlocked, authenticate, checkoutController.cancelPayment)

router.post('/payment/fail', isUserBlocked, authenticate, checkoutController.paymentFailure)

router.patch('/buy-now', isUserLoggedin, cartController.addItemToCart)

router.get('/search', productController.searchProducts)

router.get('/products/filter', productController.filterProducts)

router.get('/forgot-password', isLoggedin, userController.getForgotPasswordPage)

router.post('/forgot-password/mail', isLoggedin, userController.checkUser)

router.get('/forgot-password/:id', isLoggedin, userController.getEnterOtpPage)

router.post('/forgot-password/otp/:id', isLoggedin, userController.checkMailOtp)

router.get('/password/reset/:id', isLoggedin, userController.getResetPasswordPage)

router.post('/password/reset/:id', isLoggedin, userController.resetPassword)

router.get('/invoice/download/:id', isUserBlocked, authenticate, userMiddlewares.createInvoice, orderController.downloadInvoice)

router.get('/dashboard/address/manage', isUserBlocked, authenticate, dashboardController.getAddresPage)

router.patch('/dashboard/address/delete', isUserBlocked, authenticate, dashboardController.deleteAddress)

router.patch('/orders/return', isUserBlocked, authenticate, orderController.returnOrder)

router.all('*', userController.getPageNotFound)

module.exports = router