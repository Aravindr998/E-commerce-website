const express = require('express')
const adminController = require('../controllers/adminController')

const router = express.Router()

router.get('/login',adminController.isLoggedin, adminController.getLogin)

router.post('/login', adminController.isLoggedin, adminController.loginAdmin)

router.get('/', adminController.authenticate, adminController.getHomepage)

router.get('/products/new', adminController.authenticate, adminController.getAddProducts)

router.post('/products/new', adminController.authenticate, adminController.addProducts)

module.exports = router