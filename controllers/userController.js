require('dotenv').config()
const userModel = require('../models/users')
const bcrypt = require('bcrypt')
const axios = require('axios')
const categoryModel = require('../models/categories')
const bannerModel = require('../models/banners')
const nodemailer = require('nodemailer')
let otp

const getHomepage = async(req, res) => {
  try {
    const banner = await bannerModel.findOne({setCurrent: true})
    const categories = await categoryModel.aggregate([
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          pipeline: [
            {
              $unwind: '$skus',
            },
            {
              $match: {
                'skus.isDeleted': false,
                'skus.totalStock': {
                  $gt: 0
                }
              }
            },
            {
              $group: {
                _id: '$_id',
                title: {$first: '$title'},
                skus: {$push: '$skus'},
                categoryId: {$first: '$categoryId'},
                offerPercent: {$first: '$offerPercent'}
              }
            },
            {
              $sort: {
                title: 1
              }
            }
          ],
          as: 'products'
        }
      },
      {
        $project: {
          products: {
            $slice: ['$products', 0, 3]
          },
          categoryName: 1
        }
      }
    ])
      if(req.session.user){
        return res.render('home-page', {categories, banner, user: req.session?.user?.fname})
      }else{
        return res.render('landing-page', {categories, banner})
      }
  } catch (error) {
    console.log(error)
    return res.render('404')
  }
}

const getLogin = (req, res)=> {
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    req.session.Errmessage = null
    return res.render('login', {message})
  }else{
    const message = ""
    return res.render('login', {message})
  }
}

const getRegister = (req, res)=> {
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    const user = req.session.registerUser
    req.session.registerUser = null
    req.session.Errmessage = null
    return res.render('register', {message, user})
  }else{
    const message = ""
    const user = {}
    return res.render('register', {message, user})
  }
}

const authenticate = (req, res, next)=>{
  if(req.session.user){
    next()
  }else{
    return res.redirect('/login')
  }
}

const registerUser = async (req, res, next)=>{
  let existing
  try {
    existing = await userModel.find({$or: [{email: req.body.email}, {phone: req.body.phone}]})
  } catch (error) {
    console.log(error)
  }
  const user = new userModel({
    fname: req.body.fname,
    lname: req.body.lname,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password

  })
  if(existing.length == 0){
    if(req.body['confirm-password'] != req.body.password){
      req.session.Errmessage = "Password do not match"
      req.session.registerUser = user
      return res.json({
        redirect: '/register',
        saveStatus: false
      })
    }else if(!(req.body.phone).match(/^[6789]\d{9}$/)){
      req.session.Errmessage = "Invalid mobile number"
      req.session.registerUser = user
      return res.json({
        redirect: '/register',
        saveStatus: false
      })
    }
    try{
      await user.validate()
      res.json({saveStatus: true})
      next()
    }catch(error){
      console.log(error)
      let message;
      if(error.errors.fname){
        req.session.Errmessage = error.errors.fname.properties.message
      }else if(error.errors.lname){
        req.session.Errmessage = error.errors.lname.properties.message
      }else if(error.errors.email){
        req.session.Errmessage = error.errors.email.properties.message
      }else if(error.errors.phone){
        req.session.Errmessage = error.errors.phone.properties.message
      }else if(error.errors.password){
        req.session.Errmessage = error.errors.password.properties.message
      }
      req.session.registerUser = user
      return res.json({
        saveStatus: false,
        redirect: '/register'
      })
    }
  }else{
    req.session.Errmessage = "User already exists"
    req.session.registerUser = user
    return res.json({
      saveStatus: false,
      redirect: '/register'
    })
  }
}

const loginUser = async (req, res) => {
  try{
    if(req.body.email == "" || req.body.password == ""){
      req.session.Errmessage = "Email and password cannot be empty"
      return res.redirect('/login')
    }
    const user = await userModel.find({email: req.body.email})
    if(user.length == 0){
      req.session.Errmessage = "User does not exist"
      return res.redirect('/login')
    }else{
      try {
        const match = await bcrypt.compare(req.body.password, user[0].password)
        if(!match){
          req.session.Errmessage = "Invalid password"
          return res.redirect('/login')
        }else if(user[0].isBlocked){
            req.session.Errmessage = "Cannot sign in"
            return res.redirect('/login')
          }else{
            req.session.user = user[0]
            res.redirect('/')
          }
      } catch (error) {
        console.log(error)
      }
    }
  }catch(error){
    return res.status(500).send(error)
  }
}

const logoutUser = (req, res) => {
  req.session.user = null
  return res.redirect('/')
}

const checkOtp = async (req, res) => {
  if(req.body.otp == otp){
    const user = new userModel({
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password
    })
    try{
      await user.save()
      res.json({
        saveStatus: true,
        redirect: '/login'
      })
    }catch(error){
      console.log(error)
      res.json({
        saveStatus: true,
        redirect: '/register'
      })
    }
  }else{
    res.json({
      message: 'Invalid OTP'
    })
  }
}

const generateOtp = (req, res, next) => {
  if(req.body.otpEntered){
    next()
  }else{
    otp = Math.floor(100000 + Math.random()*900000)
    sendOtp(otp, req.body.phone)
    .then((response)=>{
      next()
    })
    .catch((error) => {
      console.log(error)
      return res.redirect('/register')
    })
  }
}

const resendOtp = (req, res, next) => {
  otp = Math.floor(100000 + Math.random()*900000)
  sendOtp(otp, req.body.phone)
  .then((response)=>{
    if(response.data.return){
      return res.json({message: "OTP sent successfully"})
    }else{
      return res.json({message: "Some error occured"})
    }
  })
  .catch((error) => {
    console.log(error)
    return res.json({message: "Could not resend, Please try again"})
  })
}


function sendOtp(otp, number){
  const body = {
    "authorization" : process.env.AUTHORIZATION_KEY,
    "variables_values" : otp,
    "route" : "otp",
    "numbers" : number
  }
  return axios({
    method : 'GET',
    url : "https://www.fast2sms.com/dev/bulkV2",
    data: body
  })
}


const getForgotPasswordPage = (req, res) => {
  let message = ""
  if(req.session.Errmessage){
    message = req.session.Errmessage
    req.session.Errmessage = null
  }
  res.render('users/forgot-password-mail', {message})
}

const checkUser = async(req, res) => {
  if(!req.body.email){
    req.session.Errmessage = 'Email cannot be empty'
    return res.redirect('/forgot-password')
  }else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)){
    req.session.Errmessage = 'Invalid email'
    return res.redirect('/forgot-password')
  }else{
    const user = await userModel.find({email: req.body.email})
    if(user.length == 0){
      req.session.Errmessage = 'User does not exist. Please sign up'
      return res.redirect('/forgot-password')
    }else{
      const otp = generateMailOtp()
      req.session.emailOtp = otp
      try {
        const info = await sendMail(user[0].email, otp)
      } catch (error) {
        console.log(error)
        req.session.Errmessage = 'Some error occured. Please try again later'
        return res.redirect('/forgot-password')
      }
      return res.redirect(`/forgot-password/${user[0]._id}`)
    }
  }
}

const getEnterOtpPage = async(req, res) => {
  try {
    if(req.session.emailOtp){
      let message = ''
      if(req.session.Errmessage){
        message = req.session.Errmessage
        req.session.Errmessage = null
      }
      const user = await userModel.findById(req.params.id)
      res.render('users/enter-mail-otp', {message, user})
    }else{
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

const checkMailOtp = async(req, res) => {
  try {
    if(req.session.emailOtp){
      if(req.body.otp == req.session.emailOtp){
        res.redirect(`/password/reset/${req.params.id}`)
      }else{
        req.session.Errmessage = 'Invalid OTP'
        res.redirect(`/forgot-password/${req.params.id}`)
      }
    }else{
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

const getResetPasswordPage = async(req, res) => {
  try {
    if(req.session.emailOtp){
      const user = await userModel.findById(req.params.id)
      let message = ''
      if(req.session.Errmessage){
        message = req.session.Errmessage
        req.session.Errmessage = null
      }
      res.render('users/reset-password', {message, user})
    }else{
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

const resetPassword = async(req, res) => {
  try {
    if(req.body.password != req.body['confirm-password']){
      req.session.Errmessage = 'Passwords do not match'
      res.redirect(`/password/reset/${req.params.id}`)
    }else{
      const user = await userModel.findById(req.params.id)
      user.password = req.body.password
      await user.save()
      req.session.emailOtp = null
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error)
  }
}

function generateMailOtp(){
  return Math.floor(100000 + Math.random()*900000)
}

function sendMail(mail, otp){
  return new Promise(async(resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    })
    let detail = {
      from: process.env.NODEMAILER_EMAIL,
      to: mail,
      subject: 'KROMA OTP',
      text: `Your OTP for resetting password is ${otp}`
    }
    try {
      let info = await transporter.sendMail(detail)
      console.log("Message sent: %s", info.messageId)
      resolve(info)
    } catch (error) {
      reject(error)
    }
    
  })
}

const getPageNotFound = (req, res) => {
    res.render('users/404', {user: req.session?.user?.fname})
}

module.exports = {
  getHomepage,
  getLogin,
  getRegister,
  authenticate,
  registerUser,
  loginUser,
  logoutUser,
  checkOtp,
  generateOtp,
  resendOtp,
  getForgotPasswordPage,
  checkUser,
  getEnterOtpPage,
  checkMailOtp,
  getResetPasswordPage,
  resetPassword,
  getPageNotFound
}