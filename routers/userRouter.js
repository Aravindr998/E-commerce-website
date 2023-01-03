const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router()

router.get('/', userController.getHomepage)

router.get('/login', userController.isLoggedin, userController.getLogin)

router.get('/register', userController.isLoggedin, userController.getRegister)

router.post('/register', userController.isLoggedin, userController.registerUser)

router.post('/login', userController.isLoggedin, userController.loginUser)

router.get('/logout', userController.logoutUser)


module.exports = router