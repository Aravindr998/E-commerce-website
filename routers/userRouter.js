const express = require('express')
const userController = require('../controllers/userController')
const userAuth = require('../middlewares/userAuthenticate')

const router = express.Router()

router.get('/', userController.getHomepage)

router.get('/login', userController.isLoggedin, userController.getLogin)

router.get('/register', userController.isLoggedin, userController.getRegister)

router.post('/register', userController.isLoggedin, userController.registerUser, userController.generateOtp)

router.post('/login', userController.isLoggedin, userController.loginUser)

router.get('/logout', userController.logoutUser)

router.post('/register/otp', userController.generateOtp, userController.checkOtp)

router.post('/register/otp/resend', userController.resendOtp)

router.get('/products', userAuth.authenticate, userController.getProductsPage)

module.exports = router