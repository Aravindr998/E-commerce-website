const express = require('express')
const adminController = require('../controllers/adminController')
const adminMiddlewares = require('../middlewares/adminMiddlewares')
const auth = require('../middlewares/adminAuth')
const router = express.Router()




router.get('/login',auth.isLoggedin, adminController.getLogin)

router.post('/login', auth.isLoggedin, auth.validateLogin, adminController.getHomepage)

//products

router.get('/', auth.authenticate, adminController.getHomepage)

router.get('/products/new', auth.authenticate, adminController.getAddProducts)

router.post('/products/new', auth.authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.addProducts)

router.get('/products/new/skus', auth.authenticate, adminController.newSku)

router.post('/products/new/skus', auth.authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.addNewSku)

router.post('/products/new/skus/new', auth.authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.saveSku)

router.post('/products/new/skus/new/2', auth.authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.saveSku2)

router.get('/products/view/:id', auth.authenticate, adminController.getDetailsPage)

router.get('/products/edit/:id', auth.authenticate, adminController.getEditPage)

router.put('/products/edit/:id', auth.authenticate, adminController.updateProduct)

router.get('/products/edit/:prodid/:skuid', auth.authenticate, adminController.getSkuEditPage)

router.put('/products/edit/skus/:id', auth.authenticate, adminMiddlewares.upload.fields([{name: 'image1', maxCount: 1}, {name: 'image2', maxCount: 1}, {name: 'image3', maxCount: 1},]), adminController.updateProductSku)

router.get('/products/skus/add/:id', auth.authenticate, adminController.getAddSkusPage)

router.patch('/products/delete/:id', auth.authenticate, adminController.deleteProduct)

router.patch('/products/delete/skus/:prodId/:skuId', auth.authenticate, adminController.deleteSku)

//users

router.get('/users', auth.authenticate, adminController.getUserList)

router.get('/users/view/:id', auth.authenticate, adminController.getUserDetails)

router.put('/users/block/:id', auth.authenticate, adminController.blockUser)

//categories

router.get('/categories', auth.authenticate, adminController.getCategoriesPage)

router.post('/categories', auth.authenticate, adminController.addNewCategory)

router.patch('/categories/:id', auth.authenticate, adminController.deleteCategory)

router.get('/logout', adminController.logoutAdmin)



module.exports = router