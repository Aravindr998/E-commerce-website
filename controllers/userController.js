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
    return res.render('login')
  },
  getRegister: (req, res)=> {
    return res.render('register')
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
        email: req.body.email,
        password: req. body.password,
        phone: req.body.phone
      })
      try{
        await user.save()
        return res.redirect('/login')
      }catch(error){
        return res.status(500).send(error)
      }
    }else{
      return res.redirect('/register')
    }
  },
  loginUser: async (req, res) => {
    try{
      const user = await userModel.find({email: req.body.email})
      if(user.length == 0){
        return res.redirect('/login')
      }else if(req.body.password != user[0].password){
        return res.redirect('/login')
      }else if(user[0].isBlocked){
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
  }
}