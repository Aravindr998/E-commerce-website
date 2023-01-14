const express = require('express')
const userController = require('../controllers/userController')
const userAuth = require('../middlewares/userAuth')

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

module.exports = router