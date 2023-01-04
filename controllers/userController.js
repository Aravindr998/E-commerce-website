const userModel = require('../models/users')

module.exports = {
  getHomepage: function(req, res){
    if(req.session.user){
      return res.render('home-page')
    }else if(req.session.admin){
      return res.redirect('/admin')
    }else{
      return res.render('landing-page')
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
    }else if(req.session.admin){
      return res.redirect('/admin')
    }else{
      return res.redirect('/login')
    }
  },
  
  isLoggedin: (req, res, next) =>{
    if(req.session.user){
      return res.redirect('/')
    }else if(req.session.admin){
      return res.redirect('/admin')
    }else{
      next()
    }
  },

  registerUser: async (req, res)=>{
    const existing = await userModel.find({email: req.body.email})
    if(existing.length == 0){
      const user = new userModel({
        fname: req.body.fname,
        lname: req.body.lname,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password

      })
      if(req.body['confirm-password'] != req.body.password){
        req.session.Errmessage = "Password do not match"
        req.session.registerUser = user
        return res.json({
          redirect: '/register',
          saveStatus: false
        })
      }
      try{
        await user.validate()
        return res.json({saveStatus: true})
      }catch(error){
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
      req.session.registerUser = existing[0]
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
      }else if(req.body.password != user[0].password){
        req.session.Errmessage = "Invalid password"
        return res.redirect('/login')
      }else if(user[0].isBlocked){
        req.session.Errmessage = "Cannot sign in"
        return res.redirect('/login')
      }else{
        req.session.user = user[0]
        res.redirect('/')
      }
    }catch(error){
      return res.status(500).send(error)
    }
  },

  logoutUser: (req, res) => {
    if(req.session.admin){
      return res.redirect('/admin')
    }else{
      req.session.destroy()
      return res.redirect('/')
    }
  },
  checkOtp: async (req, res) => {
    req.session.otp = '567890'
    otp = req.body.otp
    if(req.body.otp == req.session.otp){
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
}