const userModel = require('../models/users')

const isUserLoggedin = (req, res, next) => {
  if(req.session.user){
    next()
  }else{
    res.json({redirect: '/login'})
  }
}

const authenticate = (req, res, next) => {
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

const isLoggedin = (req, res, next) =>{
  if(req.session.user){
    return res.redirect('/')
  }else{
    next()
  }
}

const isUserBlocked = async(req, res, next) => {
  try {
    if(req.session.user){
      const user = await userModel.findById(req.session.user._id)
      if(user.isBlocked){
        req.session.user = null
      }
      next()
    }else{
      next()
    }
  } catch (error) {
    
  }
}

const validateAddress = (req, res, next) => {
  if(!req.body.street1){
    req.session.Errmessage = 'Address field cannot be empty'
  }else if(!req.body.city){
    req.session.Errmessage = 'City cannot be empty'
  }else if(!req.body.state){
    req.session.Errmessage = 'State cannot be empty'
  }else if(!req.body.zip){
    req.session.Errmessage = 'Zip cannot be empty'
  }else if(!(req.body.zip).match(/^[6]\d{5}$/)){
    req.session.Errmessage = 'Enter valid zip code'
  }
  if(req.session.Errmessage){
    req.session.address = {
      street1: req.body.street1,
      street2: req.body.street2,
      state: req.body.state,
      city: req.body.city,
      zip: req.body.zip
    }
    res.redirect('/dashboard/address/add')
  }else{
    next()
  }
}

const validateUpdateAddress = (req, res, next) => {
  if(!req.body.street1){
    req.session.Errmessage = 'Address field cannot be empty'
  }else if(!req.body.city){
    req.session.Errmessage = 'City cannot be empty'
  }else if(!req.body.state){
    req.session.Errmessage = 'State cannot be empty'
  }else if(!req.body.zip){
    req.session.Errmessage = 'Zip cannot be empty'
  }else if(!(req.body.zip).match(/^[6]\d{5}$/)){
    req.session.Errmessage = 'Enter valid zip code'
  }
  if(req.session.Errmessage){
    req.session.address = {
      street1: req.body.street1,
      street2: req.body.street2,
      state: req.body.state,
      city: req.body.city,
      zip: req.body.zip
    }
    res.redirect(`/dashboard/address/edit/${req.params.id}`)
  }else{
    next()
  }
}

module.exports = {
  authenticate,
  isLoggedin,
  validateAddress,
  isUserLoggedin,
  isUserBlocked,
  validateUpdateAddress
}