const bannerModel = require('../models/banners')
const path = require('path')

const getBannersPage = async(req, res) => {
  try {
    const banners = await bannerModel.find()
    let message = ''
    if(req.session.Errmessage){
      message = req.session.Errmessage
      req.session.Errmessage = null
    }
    res.render('admin/banners/banners', {banners, message})
  } catch (error) {
    console.log(error)
  }
}

const saveBanner = async(req, res) => {
  try {
    const {name, caption} = req.body
    if(!name){
      req.session.Errmessage = 'Name cannot be empty'
      return res.redirect('/admin/banner')
    }else if(!req.file){
      req.session.Errmessage = 'Image file is required'
      return res.redirect('/admin/banner')
    }
    const paths = req.file.path.slice(7).replace(new RegExp('\\' + path.sep, 'g'), '/')
    const banner = new bannerModel({
      name,
      caption,
      image: paths
    })
    await banner.save()
    res.redirect('/admin/banner')
  } catch (error) {
    console.log(error)
  }
}

const setCurrentBanner = async(req, res) => {
  try {
    await bannerModel.updateMany({setCurrent: true}, {$set: {setCurrent: false}})
    await bannerModel.findOneAndUpdate({_id: req.body.bannerId}, {$set: {setCurrent: true}})
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

const deleteBanner = async(req, res) => {
  try {
    await bannerModel.findOneAndUpdate({_id: req.params.id}, {$set: {isDeleted: true}})
    res.json({successStatus: true})
  } catch (error) {
    console.log(error)
    res.json({successStatus: false})
  }
}

module.exports = {
  getBannersPage,
  saveBanner,
  setCurrentBanner,
  deleteBanner,
}