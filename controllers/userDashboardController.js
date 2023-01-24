const userModel = require('../models/users')
const mongoose = require('mongoose')

const getDashboard = async(req, res) => {
  const user = await userModel.findById(req.session.user._id)
  return res.render('users/dashboard', {userDetails: user, user: req.session?.user?.fname})
}

const getDashboardEdit = async(req, res) => {
  const user = await userModel.findById(req.session.user._id)
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    req.session.Errmessage = null
    return res.render('users/dashboard-edit', {userDetails: user, message, user: req.session?.user?.fname})
  }else{
    const message = ''
    return res.render('users/dashboard-edit', {userDetails: user, message, user: req.session?.user?.fname})
  }
}

const editUser = async(req, res, next) => {
  const user = new userModel({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
    password: '1234'
  })
  try {
    await user.validate()
    res.json({saveStatus: true})
    next()
    
  } catch (error) {
    console.log(error)
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
    return res.json({
      saveStatus: false
    })
  }
}

const updateUser = async(req, res) => {
  if(otp == req.body.otp){
    try {
      await userModel.findOneAndUpdate({
        _id: req.session.user._id
      },
      {
        $set: {
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          phone: req.body.phone
        }
      })
      res.json({saveStatus: true})
    } catch (error) {
      console.log(error)
      res.json({saveStatus: false})
    }
  }else{
    res.json({message:'Invalid OTP'})
  }
}

const getAddAddress = (req, res) => {
  if(req.session.Errmessage){
    const message = req.session.Errmessage
    const address = req.session.address
    req.session.Errmessage = null
    req.session.address = null
    res.render('users/add-address', {message, address, user: req.session?.user?.fname})
  }else{
    const message = ''
    const address = {}
    res.render('users/add-address', {message, address, user: req.session?.user?.fname})
  }
}

const saveAddress = async(req, res) => {
  const address = {
    street1: req.body.street1,
    street2: req.body.street2,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip
  }
  try {
    await userModel.findOneAndUpdate({
      _id: req.session.user._id
    }, {
      $push: {
        shippingAddress: address
      }
    })
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
    res.redirect('/dashboard')
  }
}

const getEditAddressPage = async(req, res) => {
  try {
    const address = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.session.user._id)
        }
      },
      {
        $unwind: '$shippingAddress'
      },
      {
        $match: {
          'shippingAddress._id': mongoose.Types.ObjectId(req.params.id)
        }
      },
      {
        $project: {
          shippingAddress: 1
        }
      }
    ])
    if(req.session.Errmessage){
      const message = req.session.Errmessage
      req.session.Errmessage = null
      res.render('users/edit-address', {address: address[0].shippingAddress, message, user: req.session?.user?.fname})
    }else{
      const message = ''
      res.render('users/edit-address', {address: address[0].shippingAddress, message, user: req.session?.user?.fname})
    }
  } catch (error) {
    console.log(error)
  }
}

const updateAddress = async(req, res) => {
  try {
    await userModel.findOneAndUpdate({
      shippingAddress: {
        $elemMatch: {
          _id: mongoose.Types.ObjectId(req.params.id)
        }
      }
    }, 
    {
      $set: {
        'shippingAddress.$.street1': req.body.street1,
        'shippingAddress.$.street2': req.body.street2,
        'shippingAddress.$.city': req.body.city,
        'shippingAddress.$.state': req.body.state,
        'shippingAddress.$.zip': req.body.zip,
      }
    })
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getDashboard,
  getDashboardEdit,
  editUser,
  updateUser,
  getAddAddress,
  saveAddress,
  getEditAddressPage,
  updateAddress
}