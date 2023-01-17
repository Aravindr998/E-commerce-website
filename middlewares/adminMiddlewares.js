const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/products')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  fileFilter : (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if(mimetype && extname){
      return cb(null, true)
    }else{
      return cb(null, false)
    }
  }
})

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/banners')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
  }
})

const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter : (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if(mimetype && extname){
      return cb(null, true)
    }else{
      return cb(null, false)
    }
  }
})

module.exports = {
  upload,
  bannerUpload
}