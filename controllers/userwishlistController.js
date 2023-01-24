const userModel = require('../models/users')

const getWishlishPage = async(req, res) => {
  const user = await userModel.find({_id: req.session.user._id}, {wishlist: 1})
  .populate('wishlist.productId')
  const wishlist = user[0].wishlist
  let wishlistClone = JSON.parse(JSON.stringify(wishlist))
  wishlistClone.forEach((item, index, array) => {
    let temp
    item.productId.skus.forEach( sku => {
      if(sku._id.toString() == item.skuId.toString()){
        temp = sku
      }
    })
    array[index].skus = temp
  })

  res.render('users/wishlist', {wishlist: wishlistClone, user: req.session?.user?.fname})
}

const addToWishlist = async(req, res, next) => {
  const wishlist = {
    productId: req.body.prodId,
    skuId: req.body.skuId
  }
  try {
    let flag = true
    const user = await userModel.findById({_id: req.session.user._id})
    user.wishlist.forEach(item => {
      if(item.skuId == req.body.skuId){
        flag = false
      }
    })
    if(flag){
      await userModel.findOneAndUpdate({_id: req.session.user._id}, {$push: {wishlist: wishlist}})
    }
    next()
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false
    })
  }
}

const deleteFromWishlist = async(req, res, next) => {
  try {
    await userModel.findOneAndUpdate({_id: req.session.user._id}, {$pull: {wishlist: {skuId: req.body.skuId}}})
    next()
  } catch (error) {
    console.log(error)
    return res.json({
      successStatus: false
    })
  }
}
const sendResponse = (req, res) => {
  return res.json({
    successStatus: true
  })
}

module.exports = {
  getWishlishPage,
  addToWishlist,
  deleteFromWishlist,
  sendResponse
}