const express = require('express')
const adminController = require('../controllers/adminController')

const router = express.Router()

router.get('/login',adminController.isLoggedin, adminController.getLogin)

router.post('/login', adminController.isLoggedin, adminController.loginAdmin)

router.get('/', adminController.authenticate, adminController.getHomepage)

module.exports = router