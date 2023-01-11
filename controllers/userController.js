const userModel = require('../models/users')
const bcrypt = require('bcrypt')
const fast2sms = require('fast-two-sms')
const axios = require('axios')
const productModel = require('../models/products')
const categoryModel = require('../models/categories')
const mongoose = require('mongoose')
require('dotenv').config()
let otp

module.exports = {
  getHomepage: async(req, res) => {
  try {
    const categories = await categoryModel.find()
    .populate('products')
    categories.forEach(item => {
      item.products.splice(3, Infinity)
    })
    console.log(categories)
      if(req.session.user){
        return res.render('home-page', {categories})
      }else{
        return res.render('landing-page', {categories})
      }
  } catch (error) {
    console.log(error)
    return res.render('404')
  }
  },

  getLogin: (req, res)=> {
    if(req.session.Errmessage){
      const message = req.session.Errmessage
      req.session.Errmessage = null
      return res.render('login', {message})
    }else{
      const message = ""
      return res.render('login', {message})
    }
  },

  getRegister: (req, res)=> {
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
  },

  authenticate: (req, res, next)=>{
    if(req.session.user){
      next()
    }else{
      return res.redirect('/login')
    }
  },
  
  isLoggedin: (req, res, next) =>{
    if(req.session.user){
      return res.redirect('/')
    }else{
      next()
    }
  },

  registerUser: async (req, res, next)=>{
    const existing = await userModel.find({$or: [{email: req.body.email}, {phone: req.body.phone}]})
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
      }else if(!(req.body.phone).match(/^[789]\d{9}$/)){
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
  },

  loginUser: async (req, res) => {
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
  },

  logoutUser: (req, res) => {
    req.session.user = null
    return res.redirect('/')
  },
  checkOtp: async (req, res) => {
    console.log('check otp')
    console.log(otp)
    console.log(req.body.otp)
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
  },

  generateOtp: (req, res, next) => {
    console.log('generate otp')
    console.log(req.body.otp)
    if(req.body.otpEntered){
      next()
    }else{
      otp = Math.floor(100000 + Math.random()*900000)
      console.log(otp)
      sendOtp(otp, req.body.phone)
      .then((response)=>{
        console.log(response.data)
        next()
      })
      .catch((error) => {
        console.log(error)
        return res.redirect('/register')
      })
    }
  },

  resendOtp: (req, res, next) => {
    otp = Math.floor(100000 + Math.random()*900000)
    sendOtp(otp, req.body.phone)
    .then((response)=>{
      console.log(response.data)
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
  },
  getProductsPage: async(req, res) => {
    try {
      const products = await productModel.find()
      .sort({categoryId: 1})
      const categories = await categoryModel.find()
      res.render('users/product-page', {products, categories})
    } catch (error) {
      
    }
  }

}

function sendOtp(otp, number){
  console.log('sendotp')
  console.log(otp)
  const body = {
    "authorization" : process.env.AUTHORIZATION_KEY,
    "variables_values" : otp,
    "route" : "otp",
    "numbers" : number
  }
  return axios({
    method : 'GET',
    url : 'https://www.fast2sms.com/dev/bulkV2',
    data: body
  })
}