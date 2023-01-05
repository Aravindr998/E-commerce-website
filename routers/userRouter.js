const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router()

router.get('/', userController.getHomepage)

router.get('/login', userController.isLoggedin, userController.getLogin)

router.get('/register', userController.isLoggedin, userController.getRegister)

router.post('/register', userController.isLoggedin, userController.generateOtp, userController.registerUser)

router.post('/login', userController.isLoggedin, userController.loginUser)

router.get('/logout', userController.logoutUser)

router.post('/register/otp', userController.generateOtp, userController.checkOtp)

router.post('/register/otp/resend', userController.resendOtp)

module.exports = router