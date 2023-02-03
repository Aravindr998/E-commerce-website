const adminModel = require('../models/admin')
const isLoggedin = (req, res, next) => {
  if(req.session.admin){
    res.redirect('/admin')
  }else{
    next()
  }
}

const authenticate = (req, res, next) => {
  if(req.session.admin){
    next()
  }else{
    return res.redirect('/admin/login')
  }
}

const validateLogin = async (req, res, next) => {
  if(req.body.email == "" || req.body.password == ""){
    req.session.Errmessage = "Email and password cannot be empty"
    return res.redirect('/admin/login')
  }
  try{
    const admin = await adminModel.find({email: req.body.email})
    console.log(admin)
    if(admin.length == 0){
      req.session.Errmessage = "Invalid Email"
      return res.redirect('/admin/login')
    }else if(req.body.password != admin[0].password){
      req.session.Errmessage = "Invalid password"
      return res.redirect('/admin/login')
    }else{
      req.session.admin = admin[0]
      next()
    }
  }catch(error){
    return res.status(500).send(error)
  }
}
module.exports = {
  isLoggedin,
  authenticate,
  validateLogin
}